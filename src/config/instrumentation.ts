import { NodeSDK } from "@opentelemetry/sdk-node";
import { LangfuseSpanProcessor } from "@langfuse/otel";

let sdk: NodeSDK | null = null;
let isInitialized = false;

/**
 * Initializes the OpenTelemetry SDK with the Langfuse span processor.
 * Must be called early in the application lifecycle before any traced operations.
 */
export function initTracing(): NodeSDK {
  if (isInitialized && sdk) {
    return sdk;
  }

  sdk = new NodeSDK({
    spanProcessors: [new LangfuseSpanProcessor()],
  });

  sdk.start();
  isInitialized = true;

  return sdk;
}

/**
 * Flushes pending observations and cleanly shuts down the OpenTelemetry SDK.
 * Essential for CLI apps and short-lived scripts to ensure all traces reach Langfuse.
 */
export async function shutdownTracing(): Promise<void> {
  if (sdk) {
    try {
      await sdk.shutdown();
    } catch (err) {
      console.error("[Langfuse] Error during tracing shutdown:", err);
    } finally {
      sdk = null;
      isInitialized = false;
    }
  }
}
