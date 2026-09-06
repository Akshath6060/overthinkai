from app.services.run_service import execute_run


class AnalysisWorker:
    """Queue-neutral execution boundary; a Redis consumer can call the same method later."""
    def __init__(self, store, provider):
        self.store = store
        self.provider = provider

    async def execute(self, run_id: str) -> None:
        await execute_run(self.store, self.provider, run_id)
