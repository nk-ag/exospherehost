# Trigger Graph

Once you have created a graph template, you can trigger its execution by sending trigger states to the state manager. This guide shows you how to trigger graphs and monitor their execution.

The recommended way to trigger graphs is using the Exosphere Python SDK, which provides a clean interface to the State Manager API.

=== "Exosphere Python SDK"

    ```python
    from exospherehost import StateManager, TriggerState

    async def trigger_graph():
        # Initialize state manager
        state_manager = StateManager(
            namespace="MyProject",
            state_manager_uri=EXOSPHERE_STATE_MANAGER_URI,
            key=EXOSPHERE_API_KEY
        )
        
        # Create trigger state
        trigger_state = TriggerState(
            identifier="data_loader",  # Must match a node identifier in your graph
            inputs={
                "source": "/path/to/data.csv",
                "format": "csv",
                "batch_size": "1000"
            }
        )
        
        try:
            # Trigger the graph
            result = await state_manager.trigger("my-graph", state=trigger_state)
            print(f"Graph triggered successfully!")
            print(f"Run ID: {result['run_id']}")
            return result
        except Exception as e:
            print(f"Error triggering graph: {e}")
            raise

    # Run the function
    import asyncio
    asyncio.run(trigger_graph())
    ```

## Monitoring on Exosphere Dashboard

The Exosphere dashboard provides a powerful web-based interface for monitoring your graphs in real-time.

For more details on using the Exosphere dashboard see the **[Dashboard Guide](./dashboard.md)**.

## Next Steps

- **[Dashboard](./dashboard.md)** - Use the Exosphere dashboard for monitoring
- **[ARchitecture](./architecture.md)** - Learn about fanout, unites
