# 基于 LogicFlow 开发的审批流服务端项目推荐

本文档整理了基于 LogicFlow 开发的审批流/工作流服务端开源项目，供参考学习。

## 一、官方相关项目

### 1. LogicFlow 官方引擎

| 项目 | 地址 | 说明 |
|------|------|------|
| **LogicFlow** | https://github.com/didi/LogicFlow | 滴滴开源的流程图编辑框架，核心项目 |
| **LogicFlow Engine** | https://github.com/didi/LogicFlow/tree/main/packages/engine | LogicFlow 官方流程引擎，支持流程执行 |

**LogicFlow Engine 特点：**
- 支持流程的执行和调度
- 提供流程状态管理
- 支持条件分支判断
- 支持并行网关执行

```typescript
import { Engine } from '@logicflow/engine'

const engine = new Engine()
engine.load(graphData)
const result = await engine.execute()
```

### 2. LogicFlow 官方示例

| 项目 | 地址 | 说明 |
|------|------|------|
| **feature-examples** | https://github.com/didi/LogicFlow/tree/main/examples/feature-examples | 官方功能示例集合 |
| **engine-browser-examples** | https://github.com/didi/LogicFlow/tree/main/examples/engine-browser-examples | 浏览器端引擎示例 |

## 二、社区开源项目

### 1. RuoYi-Flowable 工作流系统

| 项目 | 地址 | 说明 |
|------|------|------|
| **RuoYi-Flowable** | https://gitee.com/tony2y/RuoYi-flowable | 基于 RuoYi 框架集成 Flowable 工作流引擎 |

**特点：**
- 前后端分离架构
- 集成 Flowable 流程引擎
- 提供完整的审批流功能
- 支持流程设计、部署、执行

**技术栈：**
- 后端：Spring Boot + Flowable
- 前端：Vue.js + LogicFlow（可集成）

### 2. Snowy 工作流系统

| 项目 | 地址 | 说明 |
|------|------|------|
| **Snowy** | https://gitee.com/xiaonuobase/snowy | 小诺Gin框架，含工作流模块 |

**特点：**
- 前后端分离
- 支持自定义流程
- 提供审批管理功能

### 3.芋道源码工作流

| 项目 | 地址 | 说明 |
|------|------|------|
| **yudao-cloud** | https://github.com/YunaiV/ruoyi-vue-pro | 芋道源码，含BPM工作流模块 |

**特点：**
- 微服务架构
- 集成 Flowable/Activiti
- 提供完整的 BPM 功能
- 支持流程设计器

## 三、工作流引擎推荐

### 1. Flowable（推荐）

| 项目 | 地址 | 说明 |
|------|------|------|
| **Flowable** | https://github.com/flowable/flowable-engine | 轻量级BPMN流程引擎 |

**特点：**
- 完整的 BPMN 2.0 支持
- 支持排他网关、并行网关、包容网关
- 提供 REST API
- 支持 Spring Boot 集成

**与 LogicFlow 集成方案：**
```
LogicFlow (前端设计) → BPMN XML → Flowable (后端执行)
```

### 2. Camunda

| 项目 | 地址 | 说明 |
|------|------|------|
| **Camunda** | https://github.com/camunda/camunda-bpm-platform | 企业级流程引擎 |

**特点：**
- 强大的流程引擎
- 完善的监控功能
- 支持 DMN 决策表
- 提供 Cockpit 管理界面

### 3. Activiti

| 项目 | 地址 | 说明 |
|------|------|------|
| **Activiti** | https://github.com/Activiti/Activiti | 经典工作流引擎 |

**特点：**
- 历史悠久的开源引擎
- 社区活跃
- 文档完善

## 四、LogicFlow + 工作流引擎集成方案

### 方案一：LogicFlow + Flowable

```typescript
// 前端：LogicFlow 设计流程
import LogicFlow from '@logicflow/core'
import { BPMNElements } from '@logicflow/extension'

const lf = new LogicFlow({
  container: document.getElementById('container'),
})
lf.use(BPMNElements)

// 导出 BPMN XML
const bpmnXML = await exportToBPMN(lf.getGraphRawData())

// 后端：Flowable 执行流程
// POST /process-definition/deploy
// Content-Type: application/xml
// Body: bpmnXML
```

### 方案二：LogicFlow + 自定义引擎

```typescript
// 使用 LogicFlow 官方引擎
import { Engine } from '@logicflow/engine'

class CustomEngine extends Engine {
  async executeNode(nodeId: string) {
    const node = this.getNodeModelById(nodeId)
    
    // 自定义节点执行逻辑
    switch (node.type) {
      case 'bpmn:userTask':
        return await this.executeUserTask(node)
      case 'bpmn:serviceTask':
        return await this.executeServiceTask(node)
      case 'bpmn:exclusiveGateway':
        return await this.evaluateExclusiveGateway(node)
      case 'bpmn:parallelGateway':
        return await this.evaluateParallelGateway(node)
      case 'bpmn:inclusiveGateway':
        return await this.evaluateInclusiveGateway(node)
    }
  }
}
```

### 方案三：LogicFlow + Node.js 后端

```typescript
// 后端：Node.js + Express
import express from 'express'
import { Engine } from '@logicflow/engine'

const app = express()

// 流程部署接口
app.post('/api/process/deploy', async (req, res) => {
  const { graphData } = req.body
  
  // 保存流程定义到数据库
  const processId = await saveProcessDefinition(graphData)
  
  res.json({ processId })
})

// 流程启动接口
app.post('/api/process/start', async (req, res) => {
  const { processId, variables } = req.body
  
  // 加载流程定义
  const graphData = await loadProcessDefinition(processId)
  
  // 创建引擎实例
  const engine = new Engine()
  engine.load(graphData)
  
  // 执行流程
  const result = await engine.execute(variables)
  
  res.json(result)
})

// 任务完成接口
app.post('/api/task/complete', async (req, res) => {
  const { taskId, variables } = req.body
  
  // 完成任务，推进流程
  await completeTask(taskId, variables)
  
  res.json({ success: true })
})
```

## 五、完整项目架构示例

### 前端架构

```
├── src/
│   ├── components/
│   │   ├── FlowDesigner/          # 流程设计器组件
│   │   │   ├── index.tsx
│   │   │   ├── nodes/             # 自定义节点
│   │   │   ├── edges/             # 自定义边
│   │   │   └── panels/            # 属性面板
│   │   └── FlowViewer/            # 流程查看器
│   ├── pages/
│   │   ├── ProcessDefinition/     # 流程定义页面
│   │   ├── ProcessInstance/       # 流程实例页面
│   │   └── TaskList/              # 任务列表页面
│   ├── services/
│   │   ├── flowService.ts         # 流程服务
│   │   └── taskService.ts         # 任务服务
│   └── utils/
│       ├── bpmnAdapter.ts         # BPMN 适配器
│       └── flowValidation.ts      # 流程验证
```

### 后端架构

```
├── src/
│   ├── modules/
│   │   ├── process/
│   │   │   ├── controller.ts      # 流程控制器
│   │   │   ├── service.ts         # 流程服务
│   │   │   └── entity.ts          # 流程实体
│   │   ├── task/
│   │   │   ├── controller.ts      # 任务控制器
│   │   │   ├── service.ts         # 任务服务
│   │   │   └── entity.ts          # 任务实体
│   │   └── execution/
│   │       ├── engine.ts          # 流程引擎
│   │       ├── gateway.ts         # 网关处理
│   │       └── task.ts            # 任务处理
│   └── utils/
│       ├── bpmnParser.ts          # BPMN 解析器
│       └── expressionEvaluator.ts # 表达式计算
```

## 六、推荐学习路径

### 1. 入门阶段

1. 学习 LogicFlow 基础用法
2. 了解 BPMN 2.0 规范
3. 实现简单的流程设计器

### 2. 进阶阶段

1. 集成工作流引擎（Flowable/Camunda）
2. 实现流程部署和执行
3. 开发审批功能

### 3. 高级阶段

1. 实现自定义流程引擎
2. 支持复杂网关逻辑
3. 添加流程监控和分析

## 七、参考资源

| 资源 | 地址 | 说明 |
|------|------|------|
| **LogicFlow 官方文档** | http://logic-flow.org/ | LogicFlow 官方文档 |
| **LogicFlow GitHub** | https://github.com/didi/LogicFlow | 源码和示例 |
| **Flowable 官方文档** | https://www.flowable.com/ | Flowable 文档 |
| **BPMN 2.0 规范** | https://www.omg.org/spec/BPMN/2.0/ | BPMN 规范文档 |
| **RuoYi-Flowable** | https://gitee.com/tony2y/RuoYi-flowable | 集成示例 |

## 八、总结

基于 LogicFlow 开发审批流服务端，推荐以下方案：

1. **快速落地**：LogicFlow + Flowable
   - 前端使用 LogicFlow 设计流程
   - 后端使用 Flowable 执行流程
   - 通过 BPMN XML 进行数据交换

2. **轻量方案**：LogicFlow + @logicflow/engine
   - 使用官方提供的引擎
   - 适合简单场景
   - 自定义扩展灵活

3. **企业级方案**：LogicFlow + Camunda
   - 功能强大的流程引擎
   - 完善的监控和管理
   - 适合复杂业务场景

选择方案时，需要考虑：
- 业务复杂度
- 团队技术栈
- 性能要求
- 运维成本
