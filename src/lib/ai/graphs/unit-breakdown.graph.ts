import { ChatOpenAI } from '@langchain/openai';
import { StateGraph, Annotation } from '@langchain/langgraph';
import { z } from 'zod';
import { PlutoRecord, UnitBreakdown, UnitBreakdownResult } from '../types';
import { LocalLaw84Data } from '../../services/open-data-nyc';

// Removed energy calculations import - AI service should only do AI analysis

const StateAnnotation = Annotation.Root({
  plutoData: Annotation<PlutoRecord>,
  ll84Data: Annotation<LocalLaw84Data | null>,
  unitBreakdown: Annotation<UnitBreakdown & { reasoning: string }>,
  calculatedUnits: Annotation<{
    numberOfBedrooms: number;
    ptacUnits: number;
    // Removed energyCalculations - will be handled by separate energy service
  }>,
  buildingValues: Annotation<{
    capRate: string;
    buildingValue: string;
    siteEUI: string;
    occupancyRate: string;
    maintenanceCost: string;
    energyProfile: string;
  }>,
});

const unitBreakdownSchema = z
  .object({
    studio: z.number().int().min(0).describe('Number of studio units'),
    one_bed: z.number().int().min(0).describe('Number of one-bedroom units'),
    two_bed: z.number().int().min(0).describe('Number of two-bedroom units'),
    three_plus: z
      .number()
      .int()
      .min(0)
      .describe('Number of three or more bedroom units'),
    reasoning: z
      .string()
      .describe('Detailed explanation of the unit breakdown calculation'),
  })
  .describe('Unit breakdown with counts for each type and reasoning');

export class UnitBreakdownGraph {
  private readonly model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      temperature: 0.1,
      modelName: "gpt-4o-mini",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }

  private startNode(state: typeof StateAnnotation.State) {
    console.log('Starting graph execution', { state });
    if (!state.plutoData) {
      console.error('No PLUTO data provided in initial state');
      throw new Error('No PLUTO data provided in initial state');
    }
    return { plutoData: state.plutoData };
  }

  private async inferenceNode(state: typeof StateAnnotation.State) {
    console.log('Running inference node', {
      bldgclass: state.plutoData.bldgclass,
    });

    if (!state.plutoData || !state.plutoData.unitsres) {
      console.error('Invalid PLUTO data provided');
      throw new Error('Invalid PLUTO data provided');
    }

    const prompt = `Analyze a building in ${state.plutoData.boro || 'Unknown'} with the following characteristics and provide a detailed breakdown of residential units with reasoning:

    Building Details:
    - Building Class: ${state.plutoData.bldgclass}
    - Year Built: ${state.plutoData.yearbuilt || 'Unknown'}
    - Total Residential Units: ${state.plutoData.unitsres}
    - Total Residential Area: ${state.plutoData.resarea} sq ft
    - Number of Floors: ${state.plutoData.numfloors || 'Unknown'}

    Requirements:
    1. The sum of all unit types MUST equal exactly ${state.plutoData.unitsres} total units
    2. Consider typical unit layouts and sizes for this building's era and class
    3. Account for the total residential area when determining unit mix
    4. Consider historical building practices from the construction period

    You must return:
    1. studio: Number of studio units (must be a non-negative integer)
    2. one_bed: Number of one-bedroom units (must be a non-negative integer)
    3. two_bed: Number of two-bedroom units (must be a non-negative integer)
    4. three_plus: Number of three or more bedroom units (must be a non-negative integer)
    5. reasoning: A detailed explanation of your calculation process

    IMPORTANT: 
    - All numbers must be non-negative integers
    - The sum of all unit types must exactly equal ${state.plutoData.unitsres}
    - Never return all 0s for everythign, you must always do your best to return a valid breakdown`;

    try {
      const structuredModel =
        this.model.withStructuredOutput(unitBreakdownSchema);

      const result = await structuredModel.invoke(prompt);

      console.log('LLM response received', { result });

      const total =
        result.studio + result.one_bed + result.two_bed + result.three_plus;

      if (total === 0) {
        console.error('LLM returned all zero values for unit counts');
        throw new Error('Invalid response: All unit counts are zero');
      }

      if (Number(total) !== Number(state.plutoData.unitsres)) {
        console.error(
          `LLM response total units (${total}) doesn't match PLUTO data (${state.plutoData.unitsres})`,
        );
        throw new Error(
          `LLM response total units (${total}) doesn't match PLUTO data (${state.plutoData.unitsres})`,
        );
      }

      return {
        unitBreakdown: {
          studio: result.studio,
          one_bed: result.one_bed,
          two_bed: result.two_bed,
          three_plus: result.three_plus,
          source: 'AI-Assumed' as const,
          reasoning: result.reasoning,
        },
      };
    } catch (error) {
      console.error(
        `Failed to generate unit breakdown: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      );
      throw error;
    }
  }

  private extractBuildingValuesNode(state: typeof StateAnnotation.State) {
    console.log('Running building values node');

    // Extract values from LL84 data if available, otherwise use defaults
    const siteEUI = state.ll84Data?.site_eui || '65.5';
    const occupancyRate = '95'; // No direct equivalent in LL84 data
    const maintenanceCost = '75000'; // No direct equivalent in LL84 data
    const buildingValue = '1000000'; // No direct equivalent in LL84 data
    const capRate = '5.5'; // No direct equivalent in LL84 data

    // Create energy profile based on available data
    const energyProfile = JSON.stringify({
      electric: '60%',
      gas: '40%',
    });

    return {
      buildingValues: {
        capRate,
        buildingValue,
        siteEUI,
        occupancyRate,
        maintenanceCost,
        energyProfile,
      },
    };
  }

  private calculationNode(state: typeof StateAnnotation.State) {
    console.log('Running calculation node');
    if (!state.unitBreakdown) {
      console.error('Unit breakdown not available for calculation');
      throw new Error('Unit breakdown not available for calculation');
    }

    // Calculate total bedrooms: studio(0) + 1-bed(1) + 2-bed(2) + 3+bed(3)
    const numberOfBedrooms =
      state.unitBreakdown.studio * 0 +
      state.unitBreakdown.one_bed * 1 +
      state.unitBreakdown.two_bed * 2 +
      state.unitBreakdown.three_plus * 3;

    // Calculate PTAC units needed: studio(1) + 1-bed(2) + 2-bed(3) + 3+bed(4)
    // Based on LaTeX Section 2.1: 1 bedroom + 1 living area per unit
    const ptacUnits =
      state.unitBreakdown.studio * 1 +
      state.unitBreakdown.one_bed * 2 +
      state.unitBreakdown.two_bed * 3 +
      state.unitBreakdown.three_plus * 4;

    // Removed energy calculations - will be handled by separate energy service

    return {
      calculatedUnits: {
        numberOfBedrooms,
        ptacUnits,
      },
    };
  }

  public createGraph() {
    const graph = new StateGraph(StateAnnotation)
      .addNode('start', this.startNode.bind(this))
      .addNode('inference', this.inferenceNode.bind(this))
      .addNode('extractValues', this.extractBuildingValuesNode.bind(this))
      .addNode('calculation', this.calculationNode.bind(this))
      .addEdge('__start__', 'start')
      .addEdge('start', 'inference')
      .addEdge('inference', 'extractValues')
      .addEdge('extractValues', 'calculation')
      .addEdge('calculation', '__end__')
      .compile();

    return graph;
  }

  public async run(
    plutoData: PlutoRecord,
    ll84Data?: LocalLaw84Data,
  ): Promise<UnitBreakdownResult> {
    if (!plutoData) {
      console.error('No PLUTO data provided');
      throw new Error('No PLUTO data provided');
    }

    try {
      const graph = this.createGraph();
      console.log('Running graph with PLUTO data', {
        bldgclass: plutoData.bldgclass,
      });

      const finalState = await graph.invoke({
        plutoData,
        ll84Data: ll84Data || null,
      });

      if (
        !finalState ||
        !finalState.unitBreakdown ||
        !finalState.calculatedUnits ||
        !finalState.buildingValues
      ) {
        console.error('Graph execution did not produce expected results', {
          finalState,
        });
        throw new Error('Graph execution did not produce expected results');
      }

      // Destructure nested objects to avoid repetition
      const { unitBreakdown, calculatedUnits, buildingValues } = finalState;
      const { ptacUnits, numberOfBedrooms } = calculatedUnits;

      const result: UnitBreakdownResult = {
        algorithm: 'llm-based',
        notes: `${unitBreakdown.reasoning}\nTotal PTAC units: ${ptacUnits}\nTotal Bedrooms: ${numberOfBedrooms}`,
        unitBreakdown,
        ptacUnits,
        numberOfBedrooms,

        // Building characteristics (no energy calculations)
        ...buildingValues,
      };

      console.log('Successfully generated result', { result });
      return result;
    } catch (error) {
      console.error(
        `Failed to execute graph: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
