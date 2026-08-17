import { saveDataset } from '../storage/datasets'

/** Load demo tables so tools work before you paste plant data. */
export function installSampleDatasets(): string[] {
  const names: string[] = []

  saveDataset({
    id: 'sample-cookie-weight',
    name: 'Sample: Cookie weight (g)',
    source: 'csv',
    table: {
      headers: ['Weight'],
      rows: [
        [49.2], [50.1], [50.4], [49.8], [51.0], [50.2], [49.5], [50.6],
        [50.0], [49.7], [50.3], [51.2], [49.9], [50.5], [48.8], [50.1],
        [50.7], [49.6], [50.4], [52.8], [50.0], [49.8], [50.2], [50.3],
        [49.4], [50.6], [50.1], [49.9], [50.5], [50.0],
      ],
    },
  })
  names.push('Sample: Cookie weight (g)')

  saveDataset({
    id: 'sample-defects',
    name: 'Sample: Defect counts',
    source: 'csv',
    table: {
      headers: ['Cause', 'Count'],
      rows: [
        ['Burnt edge', 42],
        ['Undersize', 28],
        ['Chip clump', 17],
        ['Broken', 11],
        ['Off-center', 8],
        ['Label tear', 4],
        ['Other', 3],
      ],
    },
  })
  names.push('Sample: Defect counts')

  saveDataset({
    id: 'sample-ovens',
    name: 'Sample: Oven A vs Oven B',
    source: 'csv',
    table: {
      headers: ['OvenA', 'OvenB'],
      rows: [
        [10.1, 11.8], [9.8, 12.1], [10.4, 11.5], [10.0, 12.4], [9.7, 11.9],
        [10.2, 12.0], [10.5, 11.6], [9.9, 12.2], [10.3, 11.7], [10.1, 12.3],
      ],
    },
  })
  names.push('Sample: Oven A vs Oven B')

  saveDataset({
    id: 'sample-regression',
    name: 'Sample: Sugar vs diameter',
    source: 'csv',
    table: {
      headers: ['Sugar_g', 'Diameter_in'],
      rows: [
        [2, 2.9], [3, 3.2], [4, 3.5], [5, 3.9], [6, 4.2],
        [3.5, 3.3], [4.5, 3.7], [5.5, 4.0], [2.5, 3.0], [6.5, 4.4],
      ],
    },
  })
  names.push('Sample: Sugar vs diameter')

  saveDataset({
    id: 'sample-subgroups',
    name: 'Sample: Subgroups (Xbar-R)',
    source: 'csv',
    table: {
      headers: ['S1', 'S2', 'S3', 'S4', 'S5'],
      rows: [
        [50.1, 49.8, 50.4, 50.0, 49.9],
        [50.2, 50.5, 49.7, 50.1, 50.3],
        [49.6, 50.0, 50.2, 49.8, 50.1],
        [50.4, 50.3, 50.6, 50.2, 50.0],
        [49.9, 50.1, 49.8, 50.0, 50.2],
        [50.0, 49.7, 50.1, 50.3, 49.9],
        [50.3, 50.2, 50.5, 50.1, 50.4],
        [49.8, 50.0, 49.9, 50.2, 50.1],
        [50.1, 50.4, 50.0, 49.8, 50.2],
        [52.0, 51.8, 52.2, 51.9, 52.1],
      ],
    },
  })
  names.push('Sample: Subgroups (Xbar-R)')

  saveDataset({
    id: 'sample-gage',
    name: 'Sample: Gage R&R',
    source: 'csv',
    table: {
      headers: ['Part', 'Operator', 'Measurement'],
      rows: [
        [1, 'A', 50.1], [1, 'A', 50.0], [1, 'B', 50.2], [1, 'B', 50.3],
        [2, 'A', 49.8], [2, 'A', 49.9], [2, 'B', 50.0], [2, 'B', 49.9],
        [3, 'A', 50.4], [3, 'A', 50.5], [3, 'B', 50.6], [3, 'B', 50.5],
        [4, 'A', 49.6], [4, 'A', 49.7], [4, 'B', 49.8], [4, 'B', 49.9],
        [5, 'A', 50.2], [5, 'A', 50.1], [5, 'B', 50.3], [5, 'B', 50.4],
      ],
    },
  })
  names.push('Sample: Gage R&R')

  saveDataset({
    id: 'sample-before-after',
    name: 'Sample: Before vs After weights',
    source: 'csv',
    table: {
      headers: ['Before', 'After'],
      rows: [
        [51.2, 50.1],
        [51.0, 49.9],
        [51.5, 50.3],
        [50.8, 50.0],
        [51.3, 49.8],
        [51.1, 50.2],
        [50.9, 50.1],
        [51.4, 49.7],
        [51.0, 50.4],
        [51.2, 50.0],
      ],
    },
  })
  names.push('Sample: Before vs After weights')

  saveDataset({
    id: 'sample-yield-by-period',
    name: 'Sample: Yield by period',
    source: 'csv',
    table: {
      headers: ['Period', 'Good', 'Total'],
      rows: [
        ['Startup / first hour', 82, 100],
        ['Steady run', 873, 900],
      ],
    },
  })
  names.push('Sample: Yield by period')

  saveDataset({
    id: 'sample-attribute-defects',
    name: 'Sample: Daily defectives (attribute)',
    source: 'csv',
    table: {
      headers: ['Day', 'Defectives', 'Inspected'],
      rows: [
        [1, 4, 100],
        [2, 6, 100],
        [3, 3, 100],
        [4, 5, 100],
        [5, 12, 100],
        [6, 4, 100],
        [7, 3, 100],
        [8, 5, 100],
        [9, 7, 100],
        [10, 4, 100],
        [11, 2, 100],
        [12, 6, 100],
      ],
    },
  })
  names.push('Sample: Daily defectives (attribute)')

  return names
}
