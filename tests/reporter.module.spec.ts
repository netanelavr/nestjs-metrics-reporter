import { Test, TestingModule } from '@nestjs/testing';
import { Registry } from 'prom-client';
import { MetricsService, ReporterModule, ReporterService } from "../src";

describe('ReporterModule', () => {
     let module: TestingModule;
     
     afterEach(async () => {
          if (module) {
               await module.close();
          }
     });
     
     it('should provide global access to metrics through ReporterService', async () => {
          module = await Test.createTestingModule({
               imports: [ReporterModule],
          }).compile();
          
          const metricsService = module.get<MetricsService>(MetricsService);
          ReporterService.init(metricsService);
          
          ReporterService.counter('test_counter');
          const metrics = await module.get<Registry>(Registry).metrics();
          expect(metrics).toContain('test_counter_total');
     });
});
