import { UnitBreakdownService } from './services/unit-breakdown.service';
import { AIServiceInterface, PlutoRecord, UnitBreakdownResult } from './types';
import { LlmBasedUnitBreakdown } from './implementations/llm-based-unit-breakdown';
import { LangsmithUnitBreakdown } from './implementations/langsmith-unit-breakdown';

export class AIService implements AIServiceInterface {
  private readonly unitBreakdownService: UnitBreakdownService;
  private readonly llmBasedUnitBreakdown: LlmBasedUnitBreakdown;
  private readonly langsmithUnitBreakdown: LangsmithUnitBreakdown;

  constructor() {
    this.unitBreakdownService = new UnitBreakdownService();
    this.llmBasedUnitBreakdown = new LlmBasedUnitBreakdown();
    this.langsmithUnitBreakdown = new LangsmithUnitBreakdown();
  }

  async analyzeUnitBreakdown(
    plutoData: PlutoRecord,
  ): Promise<UnitBreakdownResult> {
    console.log(
      `Analyzing unit breakdown for building class ${plutoData.bldgclass}`,
    );
    return this.llmBasedUnitBreakdown.analyze(plutoData);
  }

  async analyzeBatchUnitBreakdown(limit?: number): Promise<{
    graphVersion: string;
    experimentName: string;
    timestamp: string;
  }> {
    console.log(
      `Running batch unit breakdown analysis${limit ? ` with limit ${limit}` : ''}`,
    );
    return this.langsmithUnitBreakdown.analyzeBatch(limit);
  }
}
