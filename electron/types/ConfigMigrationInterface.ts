export interface ConfigMigration {
  [version: string]: (userConfig) => void;
}