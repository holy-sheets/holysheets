export interface VisualizationColumn {
  id: string
  label: string
  type: string
}

export interface VisualizationCell {
  v: string | number | boolean | null
  f?: string
}

export interface VisualizationRow {
  c: (VisualizationCell | null)[]
}

export interface VisualizationTable {
  cols: VisualizationColumn[]
  rows: VisualizationRow[]
}

export interface VisualizationResponse {
  version: string
  reqId: string
  status: string
  sig?: string
  table: VisualizationTable
  errors?: Array<{ reason: string; message: string; detailed_message: string }>
}
