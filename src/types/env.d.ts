declare namespace NodeJS {
    interface ProcessEnv {
      // API Configuration
      readonly DEEPSEEK_API_KEY: string;
      readonly DEEPSEEK_API_URL: string;
      readonly API_TIMEOUT: string;
      
      // Application Settings
      readonly NODE_ENV: 'development' | 'production' | 'test';
      readonly OFFICE_ADDIN_ID: string;
      readonly OFFICE_ADDIN_VERSION: string;
      
      // Clinical Features
      readonly CLINICAL_REVIEW_TEMPERATURE: string;
      readonly DEFAULT_REVIEW_TYPE: string;
      readonly ENABLE_CONSORT_VALIDATION: string;
      
      // Security
      readonly REQUIRE_AUTHENTICATION: string;
      readonly DATA_ANONYMIZATION: string;
    }
  }