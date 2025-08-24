![logo light](assets/logo-light.svg#gh-light-mode-only)
![logo dark](assets/logo-dark.svg#gh-dark-mode-only)
[![Docs](https://img.shields.io/badge/docs-latest-success)](https://docs.exosphere.host)
![Last commit](https://img.shields.io/github/last-commit/exospherehost/exospherehost)
[![PyPI - Version](https://img.shields.io/pypi/v/exospherehost)](https://pypi.org/project/exospherehost/)
[![Coverage](https://img.shields.io/codecov/c/gh/exospherehost/exospherehost)](https://codecov.io/gh/exospherehost/exospherehost)
![Kubernetes](https://img.shields.io/badge/Kubernetes-native-326ce5?logo=kubernetes&logoColor=white)
[![GHCR](https://img.shields.io/badge/ghcr.io-available-181717?logo=github)](https://ghcr.io/exospherehost/exospherehost)
[![Discord](https://img.shields.io/discord/816925020973432832?label=discord)](https://discord.gg/V8uuA6mmzg)
[![X follow](https://img.shields.io/twitter/follow/exospherehost?style=social)](https://x.com/exospherehost)
[![Star History](https://img.shields.io/github/stars/exospherehost/exospherehost?label=star%20history&logo=github)](https://star-history.com/#exospherehost/exospherehost)
---
Exosphere is open source infrastructure to run AI agents at scale with first party support for large data and long running flows.

Exosphere lets you define plug and playable nodes that can then be run on a reliable backbone in the form of a workflow, with:
- Dynamic State Creation at runtime
- Infinite parallel agents 
- Persistent state management
- Failure handling

This allows developers to deploy production agents that can scale beautifully to build robust autonomous AI workflows.



## Getting Started

- ### Installation
  ```bash
  uv add exospherehost
  ```

- ### Define your first node
   Each node is an atomic reusable unit on Exosphere. Once registered, you can plug it into any workflow going forward. This could be an agent, an api call, or existing code, anything you want to be a unit of your workflow. 
  ```python
    from exospherehost import BaseNode
    from pydantic import BaseModel

    class MyFirstNode(BaseNode):

        class Inputs(BaseModel):
            city:str
            #Define inputs taken by node

        class Outputs(BaseModel):
            description:str
            #Output fields from this node            

        async def execute(self) -> Outputs:    
            return Outputs(descriptor_agent(inputs.city))        
            #Execution function:
            # >>Agent
            # >>Existing Code
            # >>Anything else you want to do!
  ```

 

  Create the node and add it to a runtime to enable execution:
  ```python
  from exospherehost import Runtime

  Runtime(
    name="my-first-runtime",
    namespace="hello-world",
    nodes=[
       MyFirstNode
    ]
   ).start()
  ```

- ### Define your first flow
  
  Flows are then described connecting nodes with relationships in json objects. Exosphere runs flows as per defined trigger conditions. See [Flow defintions](docs.exosphere.host) to see more examples.
  ```json
  {
    "secrets": {},
    "nodes": [
        {
            "node_name": "MyFirstNode",
            "namespace": "hello-world",
            "identifier": "describe_city",
            "inputs": {
                "bucket_name": "initial",
                "prefix": "initial",
                "files_only": "true",
                "recursive": "false"
            },
            "next_nodes": ["create_batches"]
        },
  ```

## Documentation



## Contributing

We welcome community contributions. For guidelines, refer to our [CONTRIBUTING.md](/CONTRIBUTING.md). Further we are thankful to all the contributors helping us to simplify infrastructure starting with the process of building and deploying AI workflows and agents.

Join our Discord: https://discord.gg/msUHahrp for active community discussions. We have weekly community huddle to talk up feature dicsussions, feel free to become a part of the conversation.
