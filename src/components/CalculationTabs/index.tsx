"use client";
import React from 'react'
import { CalculationResult } from '@/types/calculation-result-type';
import Calculation from '@/components/calculation/buildingOverview';
import Emissions from '@/components/calculation/emissions';
import Energy from '@/components/calculation/energy';
import Retrofit from '@/components/calculation/retrofit';
import Scenarios from '@/components/calculation/scenarios';
import { Tabs, TabList, TabTrigger, TabContent } from '@/components/ui/tabs';

const CalculationTabs = ({ c }: { c: CalculationResult }) => {
  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue="building-overview" className="w-full" variants="styleTwo">
        <TabList>
          <TabTrigger value="building-overview">🏢 Building Overview</TabTrigger>
          <TabTrigger value="emissions-compliance">🌍 Emissions & Compliance</TabTrigger>
          <TabTrigger value="energy-cost">💸 Energy & Cost</TabTrigger>
          <TabTrigger value="retrofit-roi">📊 Retrofit ROI</TabTrigger>
          <TabTrigger value="scenarios">🧪 Scenarios</TabTrigger>
        </TabList>
        <TabContent value="building-overview">
          <Calculation c={c} />
        </TabContent>
        <TabContent value="emissions-compliance">
          <Emissions />
        </TabContent>
        <TabContent value="energy-cost">
          <Energy />
        </TabContent>
        <TabContent value="retrofit-roi">
          <Retrofit />
        </TabContent>
        <TabContent value="scenarios">
          <Scenarios />
        </TabContent>
      </Tabs>
    </div>
  )
}

export default CalculationTabs 
