import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { CumulativeSavingsData, LoanBalanceData } from '@/lib/calculations/constants/financial-constants';

interface Event {
  year: number;
  label: string;
  color: string;
}

interface LoanChartProps {
  savingsData: CumulativeSavingsData[];
  loanBalanceData: LoanBalanceData[];
  events: Event[];
}

export const LoanChart: React.FC<LoanChartProps> = ({ savingsData, loanBalanceData, events }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; data: any } | null>(null);
  const [hoveredPayback, setHoveredPayback] = useState<{ x: number; y: number; year: number } | null>(null);

  useEffect(() => {
    console.log('LoanChart useEffect:', {
      hasRef: !!svgRef.current,
      savingsDataLength: savingsData.length,
      loanBalanceDataLength: loanBalanceData.length,
      savingsDataSample: savingsData.slice(0, 2),
      loanBalanceDataSample: loanBalanceData.slice(0, 2)
    });

    if (!svgRef.current || !savingsData.length || !loanBalanceData.length) {
      console.log('Early return from LoanChart useEffect');
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 80, bottom: 60, left: 80 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(savingsData, d => d.year) as [number, number])
      .range([0, width]);

    const maxValue = Math.max(
      d3.max(savingsData, d => d.cumulativeSavings) || 0,
      d3.max(loanBalanceData, d => d.balance) || 0
    );

    const yScale = d3.scaleLinear()
      .domain([0, maxValue * 1.1])
      .range([height, 0]);

    // Grid lines
    g.selectAll(".grid-line-x")
      .data(xScale.ticks())
      .enter()
      .append("line")
      .attr("class", "grid-line-x")
      .attr("x1", d => xScale(d))
      .attr("x2", d => xScale(d))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "#e5e7eb")
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.3);

    g.selectAll(".grid-line-y")
      .data(yScale.ticks())
      .enter()
      .append("line")
      .attr("class", "grid-line-y")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", "#e5e7eb")
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.3);

    // Line generators
    const cumulativeSavingsLine = d3.line<CumulativeSavingsData>()
      .x(d => xScale(d.year))
      .y(d => yScale(d.cumulativeSavings))
      .curve(d3.curveMonotoneX);

    const loanBalanceLine = d3.line<LoanBalanceData>()
      .x(d => xScale(d.year))
      .y(d => yScale(d.balance))
      .curve(d3.curveMonotoneX);

    // Cumulative Savings line (blue)
    g.append("path")
      .datum(savingsData)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 3)
      .attr("d", cumulativeSavingsLine);

    // Loan Balance line (red)
    g.append("path")
      .datum(loanBalanceData)
      .attr("fill", "none")
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 3)
      .attr("d", loanBalanceLine);

    // Find payback period (when cumulative savings >= initial loan balance)
    const initialLoanBalance = loanBalanceData[0]?.balance || 0;
    const paybackYear = savingsData.find(d => d.cumulativeSavings >= initialLoanBalance)?.year;

    // Payback period marker
    if (paybackYear) {
      const paybackData = savingsData.find(d => d.year === paybackYear);
      if (paybackData) {
        // Money emoji with hover interaction
        g.append("text")
          .attr("x", xScale(paybackYear))
          .attr("y", yScale(paybackData.cumulativeSavings) - 15)
          .attr("text-anchor", "middle")
          .attr("font-size", "20")
          .attr("fill", "#3b82f6")
          .style("cursor", "pointer")
          .text("💰")
          .on("mouseover", () => {
            setHoveredPayback({
              x: xScale(paybackYear) + margin.left,
              y: yScale(paybackData.cumulativeSavings) + margin.top - 15,
              year: paybackYear
            });
          })
          .on("mouseout", () => {
            setHoveredPayback(null);
          });

        g.append("text")
          .attr("x", xScale(paybackYear))
          .attr("y", yScale(paybackData.cumulativeSavings) - 35)
          .attr("text-anchor", "middle")
          .attr("font-size", "12")
          .attr("fill", "#374151")
          .attr("font-weight", "bold")
          .text("Payback Period");
      }
    }

    // X-axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "#374151")
      .style("text-anchor", "middle")
      .text("Year");

    // Y-axis
    g.append("g")
      .call(d3.axisLeft(yScale).tickFormat(d => `$${((d as number) / 1000000).toFixed(1)}M`))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -60)
      .attr("x", -height / 2)
      .attr("fill", "#374151")
      .style("text-anchor", "middle")
      .text("Amount ($)");

    // Interactive dots for cumulative savings
    g.selectAll(".savings-dot")
      .data(savingsData)
      .enter()
      .append("circle")
      .attr("class", "savings-dot")
      .attr("cx", d => xScale(d.year))
      .attr("cy", d => yScale(d.cumulativeSavings))
      .attr("r", 5)
      .attr("fill", "#3b82f6")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => {
        setHoveredPoint({
          x: xScale(d.year) + margin.left,
          y: yScale(d.cumulativeSavings) + margin.top,
          data: { ...d, type: 'savings' }
        });
      })
      .on("mouseout", () => {
        setHoveredPoint(null);
      });

    // Interactive dots for loan balance
    g.selectAll(".balance-dot")
      .data(loanBalanceData)
      .enter()
      .append("circle")
      .attr("class", "balance-dot")
      .attr("cx", d => xScale(d.year))
      .attr("cy", d => yScale(d.balance))
      .attr("r", 5)
      .attr("fill", "#ef4444")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => {
        setHoveredPoint({
          x: xScale(d.year) + margin.left,
          y: yScale(d.balance) + margin.top,
          data: { ...d, type: 'balance' }
        });
      })
      .on("mouseout", () => {
        setHoveredPoint(null);
      });

    // Legend
    const legend = g.append("g")
      .attr("transform", `translate(${width - 200}, 20)`);

    legend.append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 3);

    legend.append("text")
      .attr("x", 25)
      .attr("y", 5)
      .attr("fill", "#374151")
      .style("font-size", "12px")
      .text("Cumulative Savings");

    legend.append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 20)
      .attr("y2", 20)
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 3);

    legend.append("text")
      .attr("x", 25)
      .attr("y", 25)
      .attr("fill", "#374151")
      .style("font-size", "12px")
      .text("Loan Balance");

  }, [savingsData, loanBalanceData, events]);

  return (
    <div className="relative">
      <svg ref={svgRef} width={800} height={400} />

      {/* Tooltip for data points */}
      {hoveredPoint && (
        <div
          className="absolute z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 shadow-lg pointer-events-none"
          style={{
            left: hoveredPoint.x,
            top: hoveredPoint.y - 10,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="font-semibold text-gray-900 dark:text-gray-100">Year {hoveredPoint.data.year}</div>
          {hoveredPoint.data.type === 'savings' ? (
            <>
              <div className="text-sm text-gray-600 dark:text-gray-300">Annual Savings: ${hoveredPoint.data.annualSavings?.toLocaleString()}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Cumulative Savings: ${hoveredPoint.data.cumulativeSavings?.toLocaleString()}</div>
            </>
          ) : (
            <div className="text-sm text-gray-600 dark:text-gray-300">Loan Balance: ${hoveredPoint.data.balance?.toLocaleString()}</div>
          )}
        </div>
      )}

      {/* Tooltip for payback period */}
      {hoveredPayback && (
        <div
          className="absolute z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 shadow-lg pointer-events-none"
          style={{
            left: hoveredPayback.x,
            top: hoveredPayback.y - 10,
            transform: 'translate(-50%, -100%)',
            maxWidth: '280px'
          }}
        >
          <div className="font-semibold text-gray-900 dark:text-gray-100">Simple Payback Period</div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Year {hoveredPayback.year} is when cumulative energy savings equal the initial retrofit investment cost.
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            This is the point where the project "pays for itself" through accumulated savings.
          </div>
        </div>
      )}
    </div>
  );
};