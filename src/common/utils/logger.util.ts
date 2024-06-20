import { Logger } from "@nestjs/common";

export class CustomLogger {

    private static instance: CustomLogger;
    private logger: Logger;


    private constructor(private context: string) {
        this.logger = new Logger(context);
      }

    static getInstance(context: string): CustomLogger {
        if (!CustomLogger.instance) {
          CustomLogger.instance = new CustomLogger(context);
        } else {
          CustomLogger.instance.setContext(context)
        }
        return CustomLogger.instance;
      }

      private setContext(context: string): void {
        this.context = context;
        this.logger = new Logger(context);
      }

    log(message: string) {
        this.logger.log(`[${this.context}] ${message}`);
      }
    
      error(message: string, trace: string) {
        this.logger.error(`[${this.context}] ${message}`, trace);
      }
}