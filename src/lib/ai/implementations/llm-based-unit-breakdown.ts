import { UnitBreakdownService } from '../services/unit-breakdown.service';
import { PlutoRecord, UnitBreakdownResult } from '../types';

export class LlmBasedUnitBreakdown {
  private readonly unitBreakdownService: UnitBreakdownService;

  constructor() {
    this.unitBreakdownService = new UnitBreakdownService();
  }

  async analyze(plutoData: PlutoRecord): Promise<UnitBreakdownResult> {
    console.log(
      `Running LLM-based analysis for building class ${plutoData.bldgclass}`,
    );

    try {
      return await this.unitBreakdownService.analyzeBuilding(plutoData);
    } catch (error) {
      console.error(
        `Failed to run LLM analysis: ${(error as Error).message}`,
        error,
      );
      throw error;
    }
  }
}
