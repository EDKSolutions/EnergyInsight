import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface NOIData {
  noi: number;
  year: number;
}

interface PropertyValueData {
  value: number;
  year: number;
}

interface Event {
  year: number;
  label: string;
  color: string;
}

interface PropertyValueChartProps {
  withoutUpgrade: NOIData[] | PropertyValueData[];
  withUpgrade: NOIData[] | PropertyValueData[];
  events: Event[];
  valueType: 'noi' | 'property-value';
}

export const PropertyValueChart: React.FC<PropertyValueChartProps> = ({
  withoutUpgrade,
  withUpgrade,
  events,
  valueType,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{
    year: number;
    without: number;
    with: number;
    difference: number;
  } | null>(null);

  const [hoveredEvent, setHoveredEvent] = useState<Event | null>(null);

  useEffect(() => {
    console.log('PropertyValueChart useEffect:', {
      hasRef: !!svgRef.current,
      withoutUpgradeLength: withoutUpgrade.length,
      withUpgradeLength: withUpgrade.length,
      valueType,
      withoutUpgradeSample: withoutUpgrade.slice(0, 2),
      withUpgradeSample: withUpgrade.slice(0, 2)
    });

    if (!svgRef.current || !withoutUpgrade.length || !withUpgrade.length) {
      console.log('Early return from PropertyValueChart useEffect');
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 80, bottom: 60, left: 120 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Helper function to get value from data
    const getValue = (d: any) =>
      valueType === 'noi' ? d.noi : d.value;

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(withoutUpgrade, (d: any) => d.year) as [number, number])
      .range([0, width]);

    const allValues = [...withoutUpgrade.map(getValue), ...withUpgrade.map(getValue)];
    const yScale = d3
      .scaleLinear()
      .domain([d3.min(allValues)! * 0.95, d3.max(allValues)! * 1.05])
      .range([height, 0]);

    // Grid lines
    g.selectAll('.grid-line-x')
      .data(xScale.ticks(10))
      .enter()
      .append('line')
      .attr('class', 'grid-line-x')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.7);

    g.selectAll('.grid-line-y')
      .data(yScale.ticks(8))
      .enter()
      .append('line')
      .attr('class', 'grid-line-y')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.7);

    // Line generators
    const line = d3
      .line<any>()
      .x((d) => xScale(d.year))
      .y((d) => yScale(getValue(d)))
      .curve(d3.curveMonotoneX);

    // Area between lines for difference visualization
    const areaData = withoutUpgrade.map((d, i) => ({
      year: d.year,
      without: getValue(d),
      with: getValue(withUpgrade[i]) || getValue(d),
    }));

    const area = d3
      .area<typeof areaData[0]>()
      .x((d) => xScale(d.year))
      .y0((d) => yScale(d.without))
      .y1((d) => yScale(d.with))
      .curve(d3.curveMonotoneX);

    // Add difference area
    g.append('path')
      .datum(areaData)
      .attr('fill', '#10b981')
      .attr('fill-opacity', 0.2)
      .attr('d', area);

    // Without upgrade line (red)
    g.append('path')
      .datum(withoutUpgrade)
      .attr('fill', 'none')
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 3)
      .attr('d', line);

    // With upgrade line (green)
    g.append('path')
      .datum(withUpgrade)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Event lines with hover interaction
    events.forEach((event) => {
      const eventGroup = g.append('g').attr('class', 'event-line');

      eventGroup.append('line')
        .attr('x1', xScale(event.year))
        .attr('x2', xScale(event.year))
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', event.color)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .style('cursor', 'pointer');

      // Invisible wider line for easier hovering
      eventGroup.append('line')
        .attr('x1', xScale(event.year))
        .attr('x2', xScale(event.year))
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', 'transparent')
        .attr('stroke-width', 10)
        .style('cursor', 'pointer')
        .on('mouseover', () => setHoveredEvent(event))
        .on('mouseout', () => setHoveredEvent(null));
    });

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format('d')))
      .attr('color', '#374151');

    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => `$${((d as number) / 1000000).toFixed(1)}M`))
      .attr('color', '#374151');

    // Axis labels
    const yAxisLabel = valueType === 'noi' ? 'Net Operating Income ($)' : 'Property Value ($)';

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left + 20)
      .attr('x', 0 - height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .attr('fill', '#374151')
      .style('font-weight', '500')
      .text(yAxisLabel);

    g.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.bottom - 20})`)
      .style('text-anchor', 'middle')
      .attr('fill', '#374151')
      .style('font-weight', '500')
      .text('Year');

    // Interactive dots
    const dotGroup = g.append('g').attr('class', 'dots');

    areaData.forEach((d) => {
      // Without upgrade dots (red)
      dotGroup
        .append('circle')
        .attr('cx', xScale(d.year))
        .attr('cy', yScale(d.without))
        .attr('r', 4)
        .attr('fill', '#ef4444')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseover', () => {
          setHoveredPoint({
            year: d.year,
            without: d.without,
            with: d.with,
            difference: d.with - d.without,
          });
        })
        .on('mouseout', () => setHoveredPoint(null));

      // With upgrade dots (green)
      dotGroup
        .append('circle')
        .attr('cx', xScale(d.year))
        .attr('cy', yScale(d.with))
        .attr('r', 4)
        .attr('fill', '#10b981')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseover', () => {
          setHoveredPoint({
            year: d.year,
            without: d.without,
            with: d.with,
            difference: d.with - d.without,
          });
        })
        .on('mouseout', () => setHoveredPoint(null));
    });

    // Legend
    const legend = g.append('g').attr('transform', `translate(${width - 150}, 20)`);

    legend
      .append('line')
      .attr('x1', 0)
      .attr('x2', 20)
      .attr('y1', 0)
      .attr('y2', 0)
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 3);

    legend
      .append('text')
      .attr('x', 25)
      .attr('y', 5)
      .attr('fill', '#374151')
      .style('font-size', '12px')
      .text('Without Upgrade');

    legend
      .append('line')
      .attr('x1', 0)
      .attr('x2', 20)
      .attr('y1', 20)
      .attr('y2', 20)
      .attr('stroke', '#10b981')
      .attr('stroke-width', 3);

    legend
      .append('text')
      .attr('x', 25)
      .attr('y', 25)
      .attr('fill', '#374151')
      .style('font-size', '12px')
      .text('With Upgrade');

  }, [withoutUpgrade, withUpgrade, events, valueType]);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width="800"
        height="500"
        className="bg-white rounded-lg shadow-sm"
      />
      {hoveredPoint && (
        <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 shadow-lg">
          <div className="text-sm font-semibold mb-1 text-gray-900 dark:text-gray-100">Year {hoveredPoint.year}</div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-300">Without upgrade:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">${(hoveredPoint.without / 1000000).toFixed(2)}M</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-300">With upgrade:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">${(hoveredPoint.with / 1000000).toFixed(2)}M</span>
            </div>
            <div className="flex justify-between gap-4 pt-1 border-t">
              <span className="text-gray-600 dark:text-gray-300">Difference:</span>
              <span className={`font-medium ${hoveredPoint.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${(Math.abs(hoveredPoint.difference) / 1000000).toFixed(2)}M
              </span>
            </div>
          </div>
        </div>
      )}

      {hoveredEvent && (
        <div
          className="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-2 shadow-lg pointer-events-none"
          style={{
            left: `${140 + (hoveredEvent.year - 2025) * 35}px`,
            top: '60px',
            transform: 'translateX(-50%)'
          }}
        >
          <div className="text-xs font-medium whitespace-nowrap" style={{ color: hoveredEvent.color }}>
            {hoveredEvent.label}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300">
            {hoveredEvent.year}
          </div>
        </div>
      )}
    </div>
  );
};