export type ComponentCategory = 'ingestion' | 'processing' | 'storage' | 'serving';

export interface ToolboxComponent {
  id: string;
  name: string;
  category: ComponentCategory;
  description: string;
  icon?: string;
}

export const TOOLBOX: ToolboxComponent[] = [
  // Ingestion
  {
    id: 'kafka',
    name: 'Apache Kafka',
    category: 'ingestion',
    description: 'Distributed streaming platform for high-throughput data pipelines',
  },
  {
    id: 'api-gateway',
    name: 'API Gateway',
    category: 'ingestion',
    description: 'HTTP endpoint for REST/GraphQL ingestion',
  },
  {
    id: 'direct-db',
    name: 'Direct DB Writes',
    category: 'ingestion',
    description: 'Write directly to database without message queue',
  },
  {
    id: 'kinesis',
    name: 'AWS Kinesis',
    category: 'ingestion',
    description: 'Managed streaming service for real-time data',
  },
  {
    id: 'pubsub',
    name: 'Google Pub/Sub',
    category: 'ingestion',
    description: 'Serverless messaging service',
  },

  // Processing
  {
    id: 'flink',
    name: 'Apache Flink',
    category: 'processing',
    description: 'Stateful stream processing with exactly-once semantics',
  },
  {
    id: 'spark-streaming',
    name: 'Spark Streaming',
    category: 'processing',
    description: 'Micro-batch stream processing on Spark',
  },
  {
    id: 'batch-etl',
    name: 'Batch ETL',
    category: 'processing',
    description: 'Scheduled batch processing jobs (Airflow, dbt)',
  },
  {
    id: 'lambda-functions',
    name: 'Lambda/Functions',
    category: 'processing',
    description: 'Serverless compute for event-driven processing',
  },
  {
    id: 'no-processing',
    name: 'No Processing',
    category: 'processing',
    description: 'Pass data through without transformation',
  },

  // Storage
  {
    id: 's3',
    name: 'S3/Object Store',
    category: 'storage',
    description: 'Cheap durable storage for data lake',
  },
  {
    id: 'delta-lake',
    name: 'Delta Lake',
    category: 'storage',
    description: 'ACID transactions on data lake',
  },
  {
    id: 'iceberg',
    name: 'Apache Iceberg',
    category: 'storage',
    description: 'Open table format for analytics',
  },

  // Serving
  {
    id: 'redis',
    name: 'Redis',
    category: 'serving',
    description: 'In-memory data store with sorted sets, pub/sub',
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    category: 'serving',
    description: 'Relational database for structured queries',
  },
  {
    id: 'snowflake',
    name: 'Snowflake',
    category: 'serving',
    description: 'Cloud data warehouse for analytics',
  },
  {
    id: 'elasticsearch',
    name: 'Elasticsearch',
    category: 'serving',
    description: 'Full-text search and analytics engine',
  },
  {
    id: 'dynamodb',
    name: 'DynamoDB',
    category: 'serving',
    description: 'Managed NoSQL with single-digit ms latency',
  },
  {
    id: 'cassandra',
    name: 'Apache Cassandra',
    category: 'serving',
    description: 'Distributed wide-column store for write-heavy workloads',
  },
];

export function getComponentById(id: string): ToolboxComponent | undefined {
  return TOOLBOX.find((c) => c.id === id);
}

export function getComponentsByCategory(category: ComponentCategory): ToolboxComponent[] {
  return TOOLBOX.filter((c) => c.category === category);
}

export function getComponentsByIds(ids: string[]): ToolboxComponent[] {
  return TOOLBOX.filter((c) => ids.includes(c.id));
}
