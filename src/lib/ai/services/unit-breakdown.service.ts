import { PlutoRecord, UnitBreakdownResult } from '../types';
import { UnitBreakdownGraph } from '../graphs/unit-breakdown.graph';
import { LocalLaw84Data } from '../../services/open-data-nyc';

export class UnitBreakdownService {
  private readonly graph: UnitBreakdownGraph;

  constructor() {
    this.graph = new UnitBreakdownGraph();
  }

  async analyzeBuilding(
    plutoData: PlutoRecord,
    ll84Data?: LocalLaw84Data,
  ): Promise<UnitBreakdownResult> {
    console.log(
      `Analyzing building with class ${plutoData.bldgclass} using LangGraph`,
    );

    try {
      return await this.graph.run(plutoData, ll84Data);
    } catch (error) {
      console.error(
        `Failed to analyze building: ${(error as Error).message}`,
        error,
      );
      throw error;
    }
  }
}
