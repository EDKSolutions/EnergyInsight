"use client";
import React from 'react'
import { CalculationResult } from '@/types/calculation-result-type';
import Calculation from '@/components/calculation/buildingOverview';
import Emissions from '@/components/calculation/emissions';
import Energy from '@/components/calculation/energy';
import Retrofit from '@/components/calculation/retrofit';
import Scenarios from '@/components/calculation/scenarios';
import LL97 from '@/components/calculation/ll97';
import Financing from '@/components/calculation/financing';
import { Tabs, TabList, TabTrigger, TabContent } from '@/components/ui/tabs';

const CalculationTabs = ({ c }: { c: CalculationResult }) => {
  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue="building-overview" className="w-full" variants="styleTwo">
        <TabList>
          <TabTrigger value="building-overview">🏢 Building Overview</TabTrigger>
          <TabTrigger value="energy-cost">💸 Energy Cost</TabTrigger>
          <TabTrigger value="retrofit-roi">🏗️ Retrofit Cost</TabTrigger>
          <TabTrigger value="financing">💰 Financing</TabTrigger>
          <TabTrigger value="ll97">📊 LL97 Compliance</TabTrigger>
          <TabTrigger value="emissions-compliance">🌍 Emissions Reduction</TabTrigger>
          <TabTrigger value="scenarios">🧪 Scenarios</TabTrigger>
        </TabList>
        <TabContent value="building-overview">
          <Calculation c={c} />
        </TabContent>
        <TabContent value="energy-cost">
          <Energy c={c} />
        </TabContent>
        <TabContent value="retrofit-roi">
          <Retrofit c={c} />
        </TabContent>
        <TabContent value="financing">
          <Financing c={c} />
        </TabContent>
        <TabContent value="ll97">
          <LL97 c={c} />
        </TabContent>
        <TabContent value="emissions-compliance">
          <Emissions c={c} />
        </TabContent>
        <TabContent value="scenarios">
          <Scenarios />
        </TabContent>
      </Tabs>
    </div>
  )
}

export default CalculationTabs 
