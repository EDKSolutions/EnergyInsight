import { Client, Dataset, Example, RunTree, Run } from 'langsmith';
import { evaluate } from 'langsmith/evaluation';
import type { EvaluationResult } from 'langsmith/evaluation';
import { UnitBreakdownGraph } from '../graphs/unit-breakdown.graph';
import { PlutoRecord, UnitBreakdown } from '../types';
import { getPlutoDataByBbl } from '../../services/open-data-nyc';
import * as crypto from 'crypto';

export class LangsmithUnitBreakdown {
  private readonly client: Client;
  private readonly unitBreakdownGraph: UnitBreakdownGraph;

  constructor() {
    this.client = new Client({
      apiKey: process.env.LANGSMITH_API_KEY,
    });
    this.unitBreakdownGraph = new UnitBreakdownGraph();
  }

  private async generateGraphHash(): Promise<string> {
    const graphSource = this.unitBreakdownGraph.toString();
    return crypto
      .createHash('sha256')
      .update(graphSource)
      .digest('hex')
      .substring(0, 8);
  }

  private evaluateAccuracy(run: Run, example: Example): EvaluationResult {
    const predictedRooms = run.outputs?.predicted_rooms;
    const referenceRooms = example.outputs?.['Total Bedrooms']
      ? parseInt(example.outputs['Total Bedrooms'] as string, 10)
      : null;

    if (predictedRooms === null || referenceRooms === null) {
      return { score: 0, key: 'accuracy' };
    }

    // Perfect match gets score 1.0
    if (predictedRooms === referenceRooms) {
      return { score: 1.0, key: 'accuracy' };
    }

    // Calculate score based on relative error with exponential decay
    const diff = Math.abs(predictedRooms - referenceRooms);
    const relativeError = diff / (referenceRooms || 1); // Avoid division by zero
    const score = Number(Math.exp(-relativeError).toFixed(4)); // Round to 4 decimal places for Langsmith

    return {
      score,
      key: 'accuracy',
      comment: `Predicted ${predictedRooms} rooms, actual was ${referenceRooms} (relative error: ${(relativeError * 100).toFixed(1)}%)`,
    };
  }

  private async runPrediction(inputs: { BBL: string }): Promise<{
    predicted_rooms: number;
    ptac_units: number;
    unit_breakdown: UnitBreakdown;
    reasoning: string;
  }> {
    const bbl = inputs.BBL;
    if (!bbl) {
      throw new Error('No BBL found in inputs');
    }

    const plutoRecord = await getPlutoDataByBbl(bbl);
    if (!plutoRecord) {
      throw new Error(`No PLUTO record found for BBL ${bbl}`);
    }

    const result = await this.unitBreakdownGraph.run(
      plutoRecord as PlutoRecord,
    );

    return {
      predicted_rooms: result.numberOfBedrooms,
      ptac_units: result.ptacUnits,
      unit_breakdown: result.unitBreakdown,
      reasoning: result.notes,
    };
  }

  async analyzeBatch(limit?: number): Promise<{
    graphVersion: string;
    experimentName: string;
    timestamp: string;
  }> {
    try {
      // Get dataset by name
      let dataset: Dataset | undefined;
      for await (const d of this.client.listDatasets()) {
        if (d.name === 'ds-potable-tide-21') {
          dataset = d;
          break;
        }
      }
      if (!dataset) {
        throw new Error('Dataset ds-potable-tide-21 not found');
      }

      // Get examples with limit
      const examples: Example[] = [];
      for await (const example of this.client.listExamples({
        datasetId: dataset.id,
      })) {
        examples.push(example);
        if (limit && examples.length >= limit) {
          break;
        }
      }

      // Generate a unique version hash for this run
      const graphHash = await this.generateGraphHash();

      // Run the evaluation
      const experimentResults = await evaluate(
        // Target function that processes each example
        (inputs: { BBL: string }) => this.runPrediction(inputs),

        {
          data: examples,
          evaluators: [
            (run: Run, example?: Example) => example ? this.evaluateAccuracy(run, example) : { score: 0, key: 'accuracy' },
          ],
          experimentPrefix: `unit-breakdown-${graphHash}`,
          description: limit
            ? `Evaluation of unit breakdown graph (version ${graphHash}) on ${limit} examples`
            : `Full evaluation of unit breakdown graph (version ${graphHash})`,
          metadata: {
            graphVersion: graphHash,
            timestamp: new Date().toISOString(),
            limitApplied: limit,
          },
        },
      );

      return {
        graphVersion: graphHash,
        experimentName: experimentResults.experimentName,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(
        `Failed to run experiment: ${(error as Error).message}`,
        error,
      );
      throw error;
    }
  }
}
