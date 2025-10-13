概述

 最新更新：大约 2 个月前

## Postman

Postman 是一款功能强大的 API 开发和测试工具。它能让您轻松创建、管理和测试 API。GPTBots 提供了 Postman 集合，方便您进行 API 测试。
[GPTBots Postman 集合](https://www.postman.com/planetary-shuttle-9647643/gptbots-ai/collection/zmdbudp/gptbots-api?action=share&creator=45191613)

## 基本约束

GPTBots API 被设计为符合 HTTP 和 REST 规范，查询请求使用 GET 方法，提交请求使用 POST 方法。如果一个请求不是相应的 HTTP 方法，将返回错误。

如无特殊说明，调用参数值应转码为：UTF-8， [URL 编码](https://en.wikipedia.org/wiki/Percent-encoding)。

## 鉴权方式

GPTBots REST API 采用 [HTTP 基本认证](https://en.wikipedia.org/wiki/Basic_access_authentication)，在 HTTP Header 里加 `Authorization`：

```
Authorization: Bearer ${API Key} 
```

## API 启用

1. 启用 API 服务，需要先在 GPTBots 后台，找到「Agent 集成」，选择"开发-API服务"，点击「启用」按钮即可启用API服务。
   ![Agent集成-API开关](https://res.srcgptbots.com/aigc/docs/20250522/094205821/image.png)
2. 启用 API 服务后，点击「API」卡片进入 API 管理页面，点击「创建APIKey」按钮，完成创建 APIKey 既可用于调用 GPTBots 相关 API。
   ![创建APIKey](https://res.srcgptbots.com/aigc/docs/20250522/094205821/image-1.png)

## API请求地址

### API请求地址规则：

```
https://api-${endpoint}.gptbots.ai/
```

> 其中 {endpoint} 为组织创建时所选择的数据中心，开发者应该根据实际情况，选择对应的 {endpoint}。

### 数据中心列表

GPTBots 平台的数据中心列表如下：

| 数据中心  | Endpoint | api请求地址                  |
| :-------- | :------- | :--------------------------- |
| Singapore | sg       | `https://api-sg.gptbots.ai/` |
| Thailand  | th       | `https://api-th.gptbots.ai/` |

> 若开发者不拼 `-{endpoint}`则默认数据中心为 Singapore 。
> 各数据中心 API 请求地址需要加上`endpoint`路径。例如：Singapore 数据中心所在组织的的 API 请求地址为：`https://api-sg.gptbots.ai/v2/conversation`

## API 类型

GPTBots 平台为了满足开发者业务需求，提供了丰富的 API 接口，开发者可以根据自己的需求选择合适的 API 接口进行调用。API 接口分类如下：

| API分类          | 接口描述                                        |
| :--------------- | :---------------------------------------------- |
| Conversation API | 通过该 API 与 Agent 进行交互对话。              |
| Workflow API     | 通过该 API 与 workflow 进行请求/响应。          |
| Knowldege API    | 通过该 API 管理 GPTBots 平台的知识库            |
| Database API     | 通过该 API 管理 GPTBots 平台的数据库。          |
| Models API       | 通过该 API 调用 GPTBots 平台的各类模型能力。    |
| User API         | 通过该 API 设置用户信息、用户属性和联系方式等。 |
| Analytics API    | 通过该 API 可查询积分和Tokens的使用数据。       |
| Account API      | 通过该 API 可获取该账号下的 Agent、组织等信息   |

## API 调用频率

GPTBots 平台对 API 调用频率有限制，不同分类的API的频率限制各不相同。如果超过该限制，将返回超频提示消息。具体的限制数值

- **Free Plan** ：所有类型的 API 默认限制为 3 次/分钟。
- **企业定制 Plan** ：可以联系 GPTBots 商务人员，获取定制的 API 调用频率权益。



发送消息

 最新更新：大约 1 个月前

通过本 API 可以向指定的 `conversation_id` 发送消息（message），并获取 Agent 生成的响应信息。API 支持提交文本、图片、音频和文档等作为消息内容 。

## 请求方式

```
POST
```

## 调用地址

```
https://api-${endpoint}.gptbots.ai/v2/conversation/message
```

## 调用验证

详情参见 [API 概述](https://www.gptbots.ai/src/zh_CN/API 文档/概述.md)的鉴权方式说明。

## 请求

### 请求示例

```
curl -X POST 'https://api-${endpoint}.gptbots.ai/v2/conversation/message' \
-H 'Authorization: Bearer ${API Key}' \
-H 'Content-Type: application/json' \
-d '{
    "conversation_id": "686e2646cb8ee942d9a62d79",
    "response_mode": "blocking",
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "I have uploaded 2 image files, please OCR and return 2 json records."
                },
                {
                    "type": "image",
                    "image": [
                        {
                            "base64_content": "<complete_base64_string>",
                            "format": "jpeg",
                            "name": "TAXI1"
                        },
                        {
                            "url": "https://gptbots.ai/example.png",
                            "format": "png",
                            "name": "TAXI2"
                        }
                    ]
                },
                {
                    "type": "audio",
                    "audio": [
                        {
                            "url": "https://gptbots.ai/example.mp3",
                            "format": "mp3",
                            "name": "example1 audio"
                        }
                    ]
                },
                {
                    "type": "document",
                    "document": [
                        {
                            "base64_content": "<complete_base64_string>",
                            "format": "pdf",
                            "name": "example pdf"
                        }
                    ]
                }
            ]
        }
    ],
    "conversation_config": {
        "long_term_memory": false,
        "short_term_memory": false,
        "knowledge": {
            "data_ids": [
                "58c70da0403cc812641b9356",
                "59c70da0403cc812641df35a"
            ],
            "group_ids": [
                "67c70da0403cc812641b93je",
                "69c70da0403cc812641df35f"
            ]
        }
    }
}'
```

**注意**：

1. `image`、`audio`、`document` 均同时支持 base64 编码和 URL 链接两种方式，2选1即可。

2. 开发者可以仅提交最新用户消息，GPTBots默认会组装短期记忆和长期记忆。若开发者需要自定义短期记忆，可以参考下列示例自定义短期记忆。

   ```
       "messages": [
           {
               "role": "user",
               "content": "Hello"                                //自定义短期记忆
           },
           {
               "role": "assistant",
               "content": "Hello! How can I assist you today?"   //自定义短期记忆
           },
                   {
               "role": "user",
               "content": "Hello"                                //最新用户问题
           }]
   ```

### 请求头

| 字段          | 类型             | 描述                                                         |
| :------------ | :--------------- | :----------------------------------------------------------- |
| Authorization | string           | 使用`Authorization: Bearer ${API Key}`进行调用验证，请在 API 密钥页面获取密钥作为`API Key`。 |
| Content-Type  | application/json | 数据类型，取值为 application/json。                          |

### 请求参数

| 字段                | 类型       | 必填 | 描述                                                         |
| :------------------ | :--------- | :--- | :----------------------------------------------------------- |
| conversation_id     | string     | 是   | 对话唯一标识符，必须传入需要继续对话的 conversation_id。     |
| response_mode       | string     | 是   | AI Agent 回复消息的响应和传递方式。**blocking**：阻塞型，等待执行完毕后返回结果。（请求若流程较长可能会被中断）。**streaming**：流式返回，基于 SSE（[Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)）实现流式返回。**webhook**：Agent 和 人工客服的消息都会发送到 API 页面所配置的 webhook 地址。 |
| messages            | JSON Array | 是   | 对话消息内容，支持 `user` 和 `assistant` 2 个角色来构造对话上下文。**user message**：必须存在至少 1 条，最新的 user message 应放在最后。**assistant message**:支持开发者自行构造 assistant message 作为上下文 |
| conversation_config | object     | 否   | 支持开发者在本次对话中临时调整 Agent 的功能范围，以应对特殊场景需要。**short_term_memory**：短记忆开关，支持开启和或关闭短记忆，仅本次对话生效。**long_term_memory**：长记忆开关，支持开启和或关闭长记忆，仅本次对话生效。**knowledge**：知识检索范围，支持自定义知识检索范围，仅本次对话生效。`group_ids`和`data_ids`，两者同时有值时，在其并集知识范围内进行检索，两者均为空数组时则视为不检索任何知识；当未携带`knowledge`参数时以 Agent 默认配置的知识范围进行检索。`group_ids`:知识库 ID，可能包含多个知识文档。`data_ids`:知识库中的知识文档 ID |

> **注意**：
>
> Agent 输入和输出配置页面支持针对不同类型的消息选择不同的识别方案，所支持的文件类型和文件大小也各不相同，请根据实际情况调整 API 提交的数据。消息类型最大支持的格式如下：
>
> - Text消息：string
> - Audio消息：.mp3,.wav,
> - Image消息：.jpg,.jpeg,.png,.gif,.webp
> - Document消息：.pdf,.txt,.docx,.csv,.xlsx,.html,.json,.md,.tex,.ts,.xml等

## 响应

### 响应示例

```
{
    "create_time": 1679587005,
    "conversation_id": "657303a8a764d47094874bbe",
    "message_id": "65a4ccfC7ce58e728d5897e0",
    "output": [
        {
            "from_component_branch": "1",
            "from_component_name": "组件名称",
            "content": {
                "text": "Hi, is there anything I can help you?",
                "audio": [
                    {
                        "audio": "http://gptbots.ai/example.mp3",
                        "transcript": "音频所转录的文字内容"
                    }
                ]
            }
        }
    ],
    "usage": {
        "tokens": {
           "total_tokens": 29,  //prompt + completion
            "prompt_tokens": 19, //prompt
            "prompt_tokens_details": {  
                "audio_tokens": 0,
                "text_tokens":0
            },
            "completion_tokens": 10, //completion
            "completion_tokens_details": {
                "reasoning_tokens": 0,
                "audio_tokens": 0,
                "text_tokens": 0
            }
        },
        "credits": {
            "total_credits":0.0,  //prompt + completion
            "text_input_credits": 0.0,
            "text_output_credits": 0.0,
            "audio_input_credits": 0.0,
            "audio_output_credits": 0.0
        }
    }
}
```

### 成功响应（阻塞）

> ⚠️ **blocking**响应模式下，人工接管服务不可用。
>
> | 字段            | 类型       | 描述                               |
> | :-------------- | :--------- | :--------------------------------- |
> | conversation_id | string     | 是                                 |
> | message_id      | string     | 一条对话中，某条消息的唯一标识符。 |
> | create_time     | long       | 回复的这条消息产生的时间戳。       |
> | output          | JSON Array | Agent 回复内容。                   |
> | usage           | object     | 使用消耗。                         |

### 成功响应（流式）

> ⚠️ **streaming**响应模式下，人工接管服务不可用。
>
> | 字段    | 类型   | 描述                                                         |
> | :------ | :----- | :----------------------------------------------------------- |
> | code    | int    | 消息的类型编码，3-文本类型、10-Flowagent 输出、0-结束标识、4-消耗数据、39-语音消息。 |
> | message | string | 消息类型，取值：Text、FlowOutput、End。                      |
> | data    | object | 回复内容。                                                   |

- Text message 流式数据分多次返回：

```
{"code":11,"message":"MessageInfo","data":{"message_id":"6785dba0f06d872bff9ee347"}}
{"code":3,"message":"Text","data":"我"}  
{"code":3,"message":"Text","data":"可以"}
{"code":3,"message":"Text","data":"帮"}  
{"code":3,"message":"Text","data":"助"}
{"code":3,"message":"Text","data":"你"}  
{"code":3,"message":"Text","data":"的"}
{"code":3,"message":"Text","data":"吗"}
{"code":3,"message":"Text","data":"?"}
{"code":10,"message":"FlowOutput","data":[{"content":"你好","branch":null,"from_component_name": "User Input"}]}
{"code":4,"message":"Cost","data":{"prompt_tokens":4922,"completion_tokens":68,"total_tokens":4990,"prompt_tokens_details":{"audio_tokens":0,"text_tokens":4922},"completion_tokens_details":{"reasoning_tokens":0,"audio_tokens":0,"text_tokens":68}}}
{"code":0,"message":"End","data":null}
```

- audio message 流式数据分多次返回：

```
{"code":11,"message":"MessageInfo","data":{"message_id":"67b857b6be1f2906861a5e75"}}
{"code":39,"message":"Audio","data":{"audioAnswer":"","transcript":"你好"}}
{"code":39,"message":"Audio","data":{"audioAnswer":"","transcript":"，请"}}
{"code":39,"message":"Audio","data":{"audioAnswer":"","transcript":"问"}}
{"code":39,"message":"Audio","data":{"audioAnswer":"","transcript":"有什么"}}
{"code":39,"message":"Audio","data":{"audioAnswer":"EQAUAA0...IA3bi","transcript":""}}
{"code":39,"message":"Audio","data":{"audioAnswer":"EQAUAA0...IA3bi","transcript":""}}
{"code":39,"message":"Audio","data":{"audioAnswer":"EQAUAA0...IA3bi","transcript":""}}
{"code":10,"message":"FlowOutput","data":[{"content":" Audio:https://gptbots.ai/example.wav,Transcript:(Hello! How can I assist you today?)","audioDatas":[{"transcript":"Hello! How can I assist you today?","url":"https://gptbots.ai/example.wav","seconds":3}],"from_component_name":"AI Model-1"}],"componentId":12}{"code":4,"message":"Cost","data":{"prompt_tokens":4922,"completion_tokens":68,"total_tokens":4990,"prompt_tokens_details":{"audio_tokens":0,"text_tokens":4922},"completion_tokens_details":{"reasoning_tokens":0,"audio_tokens":0,"text_tokens":68}}}
{"code":0,"message":"End","data":null}
```

### 成功响应（webhook）

> ⚠️ **webhook**响应模式下，人工接管服务可用。
> 当 Agent 配置了人工服务功能时，应该选择使用`webhook`响应模式才能接收到人工客服回复的消息。开发者在「集成-API」完成配置 webhook 地址后，GPTBots系统将向 Webhook 地址发送「Agent」和「人工客服」的响应消息。
> ![webhook配置](https://res.srcgptbots.com/aigc/docs/20250513/040215080/image.png)
> Webhook 消息详见 [Webhook模式](https://www.gptbots.ai/src/zh_CN/API Reference/对话 API/Webhook V2.md) 和[人工接管服务](https://www.gptbots.ai/zh_CN/docs/api-reference/conversation-api/human-handoff-service)。

### 失败响应

| 字段    | 类型   | 描述       |
| :------ | :----- | :--------- |
| code    | int    | 错误码。   |
| message | string | 错误详情。 |

### 错误码

| Code  | Message                               |
| :---- | :------------------------------------ |
| 40000 | 参数错误                              |
| 40127 | 开发者鉴权失败                        |
| 40356 | 会话不存在                            |
| 40358 | 会话ID与智能体或用户不匹配            |
| 40364 | 该 智能体 未使用支持图片模态的 大模型 |
| 50000 | 系统内部错误                          |
| 20040 | 超过问题长度限制                      |
| 20022 | 积分不足                              |
| 20055 | 禁止使用api功能,请确保API开关已经打开 |

Webhook 模式

 最新更新：大约 2 个月前

当前 GPTBots Agent 的消息响应模式支持:`blocking`,`streaming`和`webhook`三种方式。当开发者使用 `webhook 模式` 接收响应消息时， 会将`AI回复消息` 或 `人工客服回复消息`提交到指定的 webhook 地址。

| 响应模式  | 该模式所支持的消息回复类型      |
| :-------- | :------------------------------ |
| blocking  | Agent回复消息                   |
| streaming | Agent回复消息                   |
| webhook   | 人工客服回复消息、Agent回复消息 |

## 请求方式

```
POST
```

## 调用地址

请在 Agent - 集成 - API - webhook 页面配置**你的消息接收地址**。

## 调用验证

详情参见 API 概述的鉴权方式说明。

## 请求

### 请求示例

```
curl -X POST 'YOUR_API_URL' \
-H 'Authorization: Bearer ${API Key}' \
-H 'Content-Type: application/json' \
-d '{
    "create_time": 1679587005,
    "conversation_id": "657303a8a764d47094874bbe",
    "message_id": "65a4ccfC7ce58e728d5897e0",
    "output": [
        {
            "from_component_branch": "1",
            "from_component_name": "Component Name",
            "content": {
                "text": "Hi, is there anything I can help you?",
                "audio": [
                    {
                        "audio": "http://gptbots.ai/example.mp3",
                        "transcript": "The transcribed content of the audio"
                    }
                ]
            }
        }
    ],
    "usage": {
        "tokens": {
           "total_tokens": 29,
            "prompt_tokens": 19,
            "prompt_tokens_details": 
                {  
                    "audio_tokens": 0,
                    "text_tokens":0
                },
            "completion_tokens": 10,
            "completion_tokens_details": 
                {
                    "reasoning_tokens": 0,
                    "audio_tokens": 0,
                    "text_tokens": 0
                }
        },
        "credits": {
            "total_credits":0.0,  //prompt + completion
            "text_input_credits": 0.0,
            "text_output_credits": 0.0,
            "audio_input_credits": 0.0,
            "audio_output_credits": 0.0
        }
    }
}'
```

### 请求头

| 字段          | 类型                     | 描述                                                         |
| :------------ | :----------------------- | :----------------------------------------------------------- |
| Authorization | Bearer or Basic ${token} | 若开发者启用鉴权，使用 Authorization: Bearer OR Basic ${token}进行调用验证，否则可不填写。 |
| Content-Type  | application/json         | 数据类型，取值为 application/json。                          |

### 请求参数

| 字段            | 类型       | 描述                               |
| :-------------- | :--------- | :--------------------------------- |
| conversation_id | string     | 对话的唯一标识符                   |
| message_id      | string     | 一条对话中，某条消息的唯一标识符。 |
| create_time     | long       | 回复的这条消息产生的时间戳。       |
| output          | JSON Array | AI Agent 回复内容。                |
| usage           | object     | 使用消耗。                         |

## 响应

### 响应示例

```
{
  "code": 200,
  "msg": "success"
}
```

获取对话列表

 最新更新：28 天前

获取指定筛选条件范围内，Agent 所有对话的 `conversation_id`、`user_id`、最近对话时间、对话主题、对话类型、对话内的消息总数、消耗积分数等信息。

## 请求方式

```
GET
```

## 调用地址

```
https://api-${endpoint}.gptbots.ai/v1/bot/conversation/page
```

## 调用验证

详情参见 [API 概述](https://www.gptbots.ai/src/zh_CN/API 文档/概述.md)的鉴权方式说明。

## 请求

### 请求示例

```
curl -X GET 'https://api-${endpoint}.gptbots.ai/v1/bot/conversation/page?page=1&conversation_type=API&start_time=1691942400000&end_time=1699868066999&page_size=50&user_id=1234567890' \ 
-H 'Authorization: Bearer ${API Key}'
```

### 请求头

| 字段          | 类型              | 描述                                                         |
| :------------ | :---------------- | :----------------------------------------------------------- |
| Authorization | Bearer ${API Key} | 使用`Authorization: Bearer ${API Key}`进行调用验证，请在 API 密钥页面获取密钥作为`API Key`。 |

### 请求参数

| 字段              | 类型   | 必填 | 描述                                                         |
| :---------------- | :----- | :--- | :----------------------------------------------------------- |
| conversation_type | string | 是   | 对话ID来源类型，可设置为:`ALL`、`API`、`EMBED`等多个来源类型。 |
| user_id           | string | 否   | User ID。若不填写，则视为不限制。                            |
| start_time        | long   | 是   | 最近对话时间（开始），时间戳。                               |
| end_time          | long   | 是   | 最近对话时间（结束），时间戳。                               |
| page              | int    | 是   | 页码数，即需要请求第几页，从 1 开始。                        |
| page_size         | int    | 是   | 每页的数据量，范围 1-100。                                   |

> 注意：conversation_type 的取值详见[用户概述](https://www.gptbots.ai/zh_CN/docs/api-reference/user-api/user-overview)的表格中的**对话ID（conversation_id）来源字段值列表**。

## 响应

### 响应示例

```
{
  "list": [
    {
      "conversation_id": "AaACmo05Yrqb6bOSTbsg",
      "user_id": "3",
      "recent_chat_time": 1694572952383,
      "subject": "2+3=?",
      "conversation_type": "API",
      "message_count": 2,
      "cost_credit": 0.01,
      "bot_id": "64b902a84f1ff25d1c60c10b"
    },
    {
      "conversation_id": "64ec1508c9c1ed5605e6ff28",
      "user_id": "33",
      "recent_chat_time": 1693194862160,
      "subject": "Hello!",
      "conversation_type": "API",
      "message_count": 20,
      "cost_credit": 0.59,
      "bot_id": "64b902a84f1ff25d1c60c10b"
    }
  ],
  "total": 2
}
```

### 成功响应

| 字段  | 类型       | 描述           |
| :---- | :--------- | :------------- |
| list  | JSON Array | 对话列表。     |
| total | int        | 返回的对话数。 |

### 失败响应

| 字段    | 类型   | 描述     |
| :------ | :----- | :------- |
| code    | int    | 错误码   |
| message | string | 错误详情 |

### 错误码

| Code  | Message      |
| :---- | :----------- |
| 40000 | 参数错误     |
| 20059 | Agent 已删除 |

获取消息明细

 最新更新：大约 2 个月前

根据入参的 `conversation_id` ，获取该条对话内的所有消息内容明细，包含`message_id`、用户问题、消息类型、消息内容、消息产生时间等信息。

## 请求方式

```
GET
```

## 调用地址

```
https://api-${endpoint}.gptbots.ai/v1/messages
```

## 调用验证

详情参见 [API 概述](https://www.gptbots.ai/src/zh_CN/API 文档/概述.md)的鉴权方式说明。

## 请求

### 请求示例

```
curl -X GET 'https://api-${endpoint}.gptbots.ai/v1/messages?conversation_id=xxxxxx&user_id=123456&page=1&page_size=100' \
-H 'Authorization: Bearer ${API Key}'
```

### 请求头

| 字段          | 类型              | 描述                                                         |
| :------------ | :---------------- | :----------------------------------------------------------- |
| Authorization | Bearer ${API Key} | 使用`Authorization: Bearer ${API Key}`进行调用验证，请在 API 密钥页面获取密钥作为`API Key`。 |

### 请求参数

| 字段            | 类型   | 必填 | 描述                                                      |
| :-------------- | :----- | :--- | :-------------------------------------------------------- |
| conversation_id | string | 是   | 对话标识符。                                              |
| page            | int    | 是   | 页数，表示你想请求第几页的数据。                          |
| page_size       | int    | 是   | 每页的数据量，表示你希望每页返回多少条数据，最多 100 条。 |

## 响应

### 响应示例

```
{
  "total": 100,
  "messages": [
    {
      "message_id": "645dd86906931c4a9e0ffb1f",
      "parent_message_id": "",
      "message_type": "ANSWER",
      "text": "你好，我是一个客服机器人，你可以在这里得到问题解答",
      "create_time": 1683871849906
    },
    {
      "message_id": "745dd86906931c4a9e0ffb1f",
      "parent_message_id": "645dd86906931c4a9e0ffb1f",
      "message_type": "QUESTION",
      "text": "极光推送的功能介绍",
      "create_time": 1683871849906
    },
    {
      "message_id": "845dd86906931c4a9e0ffb1f",
      "parent_message_id": "745dd86906931c4a9e0ffb1f",
      "message_type": "ANSWER",
      "text": "极光推送是一个强大的平台。...",
      "create_time": 1683871849906
    }
  ]
}
```

### 成功响应

| 字段     | 类型       | 描述                 |
| :------- | :--------- | :------------------- |
| total    | string     | 本对话中的消息总数。 |
| messages | JSON Array | 消息详情。           |

### 失败响应

| 字段    | 类型   | 描述       |
| :------ | :----- | :--------- |
| code    | int    | 错误码。   |
| message | string | 错误详情。 |

### 错误码

| Code  | Message                  |
| :---- | :----------------------- |
| 40000 | 参数错误                 |
| 40005 | 分页参数不能大于实际数量 |
| 40127 | 开发者鉴权失败           |
| 40356 | 会话不存在               |
| 20059 | Agent 已删除             |



生成建议问题

 最新更新：大约 2 个月前

基于某轮对话中 Agent 的回复消息，为用户提供几个可用于继续聊天的问题。

## 请求方式

```
GET
```

## 调用地址

```
https://api-${endpoint}.gptbots.ai/v1/next/question
```

## 调用验证

详情参见 [API 概述](https://www.gptbots.ai/src/zh_CN/API 文档/概述.md)的鉴权方式说明。

## 请求

### 请求示例

```
curl -X GET 'https://api-${endpoint}.gptbots.ai/v1/next/question?answer_id=65deb0cb2bab4d7c8061d87d' \
-H 'Authorization: Bearer ${API Key}'
```

### 请求头

| 字段          | 类型              | 描述                                                         |
| :------------ | :---------------- | :----------------------------------------------------------- |
| Authorization | Bearer ${API Key} | 使用`Authorization: Bearer ${API Key}`进行调用验证，请在 API 密钥页面获取密钥作为`API Key`。 |

### 请求参数

| 字段      | 类型   | 必填 | 描述                  |
| :-------- | :----- | :--- | :-------------------- |
| answer_id | string | true | Agent 回复的消息 ID。 |

## 响应

### 响应示例

```
{
    "questions": [
        "需要什么样的产品支持？",
        "有关我们的服务有什么疑问？",
        "您对我们的产品有什么建议？"
    ]
}
```

### 成功响应

| 字段      | 类型  | 描述             |
| :-------- | :---- | :--------------- |
| questions | Array | 生成的建议问题。 |

### 失败响应

| 字段    | 类型   | 描述       |
| :------ | :----- | :--------- |
| code    | int    | 错误码。   |
| message | string | 错误详情。 |

### 错误码

| Code   | Message                 |
| :----- | :---------------------- |
| 40000  | 参数错误                |
| 40379  | 积分不足                |
| 200222 | Bot设置不支持下一步问题 |
| 40378  | Bot已删除               |
| 20055  | 禁止使用 API 功能       |
| 40127  | 开发者鉴权失败          |



获取回答引用知识

 最新更新：大约 2 个月前

获取 Agent 回答所引用的知识库切片数据，包括了切片内容、切片所属文档ID、文档名称、来源 URL、相关性得分等。

## 请求方式

```
GET
```

## 调用地址

```
https://api-${endpoint}.gptbots.ai/v1/correlate/dataset
```

## 调用验证

详情参见 [API 概述](https://www.gptbots.ai/src/zh_CN/API 文档/概述.md)的鉴权方式说明。

## 请求

### 请求示例

```
curl -X GET 'https://api-${endpoint}.gptbots.ai/v1/correlate/dataset?message_id=65e04591a0e1e42392696d78' \
-H 'Authorization: Bearer ${API Key}'
```

### 请求头

| 字段          | 类型              | 描述                                                         |
| :------------ | :---------------- | :----------------------------------------------------------- |
| Authorization | Bearer ${API Key} | 使用`Authorization: Bearer ${API Key}`进行调用验证，请在 API 密钥页面获取密钥作为`API Key`。 |

### 请求参数

| 字段       | 类型   | 必填 | 描述                  |
| :--------- | :----- | :--- | :-------------------- |
| message_id | string | true | Agent 回复的消息 ID。 |

## 响应

### 响应示例

```
{
    "conversation_id": "65dc320df07244300b25b993",
    "question_id": "65dc323ef07244300b25b9c5",
    "answer_id": "65dc323ef07244300b25b9c6",
    "correlate_dataset": [
        {
            "content": "[中国的历史]中国第一位女皇帝是武则天。",
            "data_id": "65dc3234f07244300b25b9b9",
            "data_name": "中国的历史",
            "source_url": "https://www.example.com/chinese-history",
            "score": 0.93492633
        }
    ]
}
```

### 成功响应

| 字段              | 类型       | 描述           |
| :---------------- | :--------- | :------------- |
| conversation_id   | string     | 会话 ID        |
| question_id       | string     | 问题 ID        |
| answer_id         | string     | Agent 回答 ID  |
| correlate_dataset | JSON Array | 引用的知识数据 |

### 失败响应

| 字段    | 类型   | 描述       |
| :------ | :----- | :--------- |
| code    | int    | 错误码。   |
| message | string | 错误详情。 |

### 错误码

| Code   | Message                |
| :----- | :--------------------- |
| 40000  | 参数错误               |
| 40379  | 积分不足               |
| 200222 | Agent 不支持文档相关性 |
| 40378  | Agent 已删除           |
| 20055  | 禁止使用 API 功能      |
| 40127  | 开发者鉴权失败         |

Agent 回复反馈

 最新更新：大约 2 个月前

支持 Agent 的**用户**对 Agent 的生成内容进行反馈，以帮助 Agent 开发者优化。

## 请求方式

```
POST
```

## 调用地址

```
https://api-${endpoint}.gptbots.ai/v1/message/feedback
```

## 调用验证

详情参见 [API 概述](https://www.gptbots.ai/src/zh_CN/API 文档/概述.md)的鉴权方式说明。

## 请求

### 请求示例

```
curl -X POST 'https://api-${endpoint}.gptbots.ai/v1/message/feedback' \ 
-H 'Authorization: Bearer ${API Key}' \	
-H 'Content-Type: application/json' \ 
-d '{
        "answer_id": "123456789",
                "feedback": "POSITIVE"
}'
```

### 请求头

| 字段          | 类型              | 描述                                                         |
| :------------ | :---------------- | :----------------------------------------------------------- |
| Authorization | Bearer ${API Key} | 使用`Authorization: Bearer ${API Key}`进行调用验证，请在 API 密钥页面获取密钥作为`API Key`。 |
| Content-Type  | application/json  | 数据类型，取值为`application/json`。                         |

### 请求参数

| 字段      | 类型   | 必填 | 描述                                                         |
| :-------- | :----- | :--- | :----------------------------------------------------------- |
| answer_id | string | 是   | Agent 回复的消息 ID。                                        |
| feedback  | string | 是   | 对 Agent 回复的反馈。 - POSITIVE：积极、喜欢、点赞、认可 - NEGATIVE：消极、不喜欢、点倒、不认可 - CANCELED：取消反馈 |

## 响应

### 响应示例

```
{
    "affectCount": 0
}
```

### 成功响应

| 字段        | 类型 | 描述                               |
| :---------- | :--- | :--------------------------------- |
| affectCount | long | 本次反馈的成功数。成功反馈则为 1。 |

### 失败响应

| 字段    | 类型   | 描述       |
| :------ | :----- | :--------- |
| code    | int    | 错误码。   |
| message | string | 错误详情。 |

### 错误码

| Code  | Message        |
| :---- | :------------- |
| 40000 | 参数错误       |
| 40127 | 开发者鉴权失败 |
| 20059 | Agent 已删除   |

Agent 回复反馈

 最新更新：大约 2 个月前

支持 Agent 的**开发运维人员**对 Agent 的生成内容进行质检评价，以统计 Agent 的回复质量和帮助后续优化。

## 请求方式

```
POST
```

## 调用地址

```
https://api-${endpoint}.gptbots.ai/v1/message/quality
```

## 调用验证

详情参见 API 概述的鉴权方式说明。

## 请求

### 请求示例

```
curl -X POST 'https://api-${endpoint}.gptbots.ai/v1/message/quality' \
-H 'Authorization: Bearer ${API Key}' \
-H 'Content-Type: application/json' \
-d '{
        "answer_id": "123456789",
        "quality": "FULLY_RESOLVED"
    }'
```

### 请求头

| 字段          | 类型              | 描述                                                         |
| :------------ | :---------------- | :----------------------------------------------------------- |
| Authorization | Bearer ${API Key} | 使用`Authorization: Bearer ${API Key}`进行调用验证，请在 API 密钥页面获取密钥作为`API Key`。 |
| Content-Type  | application/json  | 数据类型，取值为 application/json。                          |

### 请求体

| 字段      | 类型   | 必填 | 描述                                                         |
| :-------- | :----- | :--- | :----------------------------------------------------------- |
| answer_id | string | 是   | Agent 的回复ID。                                             |
| quality   | string | 是   | 对 Agent 回复的质检评价。可选值： - NONE：无反馈 - UNRESOLVED：未解决 - PARTIALLY_RESOLVED：未完全解决 - FULLY_RESOLVED：完全解决 |

## 响应

### 响应示例

```
{
    "affectCount": 1
}
```

### 成功响应

| 字段        | 类型 | 描述                           |
| :---------- | :--- | :----------------------------- |
| affectCount | long | 本次评价的成功数。成功则为 1。 |

### 失败响应

| 字段    | 类型   | 描述     |
| :------ | :----- | :------- |
| code    | int    | 错误码   |
| message | string | 错误详情 |

### 错误码

| Code  | Message        |
| :---- | :------------- |
| 40000 | 参数错误       |
| 40127 | 开发者鉴权失败 |
| 20059 | Agent 已删除   |

人工服务

 最新更新：15 天前

当开发者选择**Webhook 作为人工服务接入方式**时，首先需要在自己的服务器环境构建一个 Webhook 服务，**开发者需要按规范提供以下3个接口**用于接收人工服务请求、接收用户消息和人工客服回复消息。GPTBots 同时提供了2个接口用于接收客服回复消息和对话关闭指令。

**注意事项：**

1. 开发者应确保 Webhook 服务正常可用，否则会影响人工服务的正常使用。

- 若发起人工服务后显示“正忙”，代表开发者的 Webhook 服务**异常**。
- 若发起人工服务后显示“正在连接”，代表开发者的 Webhook 服务**正常**。

1. 当成功发起人工服务请求后，

- 开发者需要及时调用**回复用户消息**接口(https://api.gptbots.ai/v1/human/message/receive)回复用户1条消息，方可成功建立对话连接。
- 开发者若未回复用户消息，超过所设置的**等待超时**时长（默认60S）后，人工对话会自动结束。

## 接收人工服务对话请求通知

当终端用户发起人工服务请求时，GPTBots将该请求透传给开发者的 Webhook 服务，开发者接口服务返回`200`则代表创建人工服务成功。

### 请求方式

```
POST
```

### 调用地址

```
https://your_domain/conversation/establish
```

### 请求示例

```
curl -X POST 'https://YOUR_DOMAIN/human/service/conversation/establish' \
-H "Content-Type: application/json" \
-d '{
  "body": [
    {
      "text": "human service",
      "message_type": "QUESTION"
    },
    {
      "text": "content",
      "message_type": "ANSWER"
    }
  ],
  "timestamp": 1742265090895,
  "email": "bob@gmail.com",
  "conversation_id": "67d8db020fa31d1ef64f53dg",
  "bot_id": "665d88b03ce2b13cf2d573454",
  "user_info": {
    "phone": null,
    "email": "bob@gmail.com",
    "user_id": "KDslas",
    "anonymous_id": "652face5184b30540a6ea7fe"
  }
}'
```

> 注意：该请求体中的`conversation_id` 仅用于标识人工服务对话场景的惟一ID，区别于 [创建对话ID](https://www.gptbots.ai/zh_CN/docs/api-reference/conversation-api/create-conversation) 为Agent对话场景所生成的惟一ID。

### 请求头

| 字段         | 类型             | 描述                                |
| :----------- | :--------------- | :---------------------------------- |
| Content-Type | application/json | 数据类型，取值为 application/json。 |

### 请求参数

| 参数              | 类型         | 说明                                                         |
| :---------------- | :----------- | :----------------------------------------------------------- |
| conversation_id   | string       | 人工客服场景的会话id（区别与Agent对话场景的会话id），在客服回复接口需要透传给GPTBots |
| timestamp         | long         | 时间戳                                                       |
| email             | string       | 用户邮箱，部分人工服务系统必须提供邮箱方可正常提供服务       |
| bot_id            | string       | Agent（原 bot）的id                                          |
| body              | list<Object> | 消息体                                                       |
| body.message_type | string       | 消息类型，QUESTION/ANSWER                                    |
| body.text         | string       | 客户发起人工客服的问题以及上下文                             |
| user_info         | object       | 用户信息                                                     |

> `email` 字段使用注意事项：
>
> - 通过 iframe/Share/Bubble Widget 方式发起人工服务时，用户必须填写用户邮箱.也同时允许开发者自定义用户邮箱从而避免用户填写邮箱。
> - 通过 WhatsApp/Telegram/livechat 等三方平台请求人工服务时，默认使用 [support@gptbots.ai](mailto:support@gptbots.ai)作为用户邮箱，其中livechat支持开发者自定义用户邮箱。
> - 通过 API 请求人工服务时，允许 email 字段为空，为空时默认使用 [support@gptbots.ai](mailto:support@gptbots.ai) 作为用户邮箱。

### 响应

| 参数    | 类型   | 说明   |
| :------ | :----- | :----- |
| code    | int    | 响应码 |
| message | string | 详情   |

## 聊天接口

通过创建的`conversation_id`，将用户的消息发送给人工客服。

### 请求方式

```
POST
```

### 调用地址

https://your_domain/chat

### 请求参数

| 参数            | 类型   | 说明                                     |
| :-------------- | :----- | :--------------------------------------- |
| conversation_id | string | 对话ID，在客服回复接口需要透传给 GPTBots |
| timestamp       | long   | 时间戳                                   |
| body            | string | 用户的消息                               |

### 响应

| 参数    | 类型   | 说明   |
| :------ | :----- | :----- |
| code    | int    | 响应码 |
| message | string | 详情   |

## 关闭会话接口

用户对话超时或者 Agent 用户主动关闭对话时，调用此接口关闭会话

### 请求方式

```
POST
```

### 调用地址

https://your_domain/conversation/close

### 请求参数

| 参数            | 类型   | 说明                                                       |
| :-------------- | :----- | :--------------------------------------------------------- |
| conversation_id | string | 对话ID，在客服回复接口需要透传给 GPTBots                   |
| timestamp       | long   | 时间戳                                                     |
| type            | string | 关闭的类型、TIMEOUT（超时关闭）/ USER_CLOSED(用户主动关闭) |

### 响应

| 参数    | 类型   | 说明     |
| :------ | :----- | :------- |
| code    | int    | 响应码， |
| message | string | 详情     |

## 回复用户消息

开发者选择`webhook`作为人工服务接入方式时，GPTBots 提供用于回复用户消息的接口，可将人工客服所发送的消息内容发送给用户。

### 请求方式

```
POST
```

### 调用地址

https://api.gptbots.ai/v1/human/message/receive

### 请求参数

| 参数            | 类型   | 说明                                           | required |
| :-------------- | :----- | :--------------------------------------------- | :------- |
| conversation_id | string | 对话ID，在对话创建接口和聊天接口有传，透传即可 | true     |
| timestamp       | long   | 时间戳                                         | true     |
| body            | string | 人工客服的回复内容                             | true     |

### 响应

| 参数    | 类型   | 说明     |
| :------ | :----- | :------- |
| code    | int    | 响应码， |
| message | string | 详情     |

## 人工客服关闭会话

开发者选择`webhook`作为人工服务接入方式时，GPTBots 提供的人工客服在需要时可以选择主动关闭对话的接口，关闭后用户将不能再接收到客服的消息，除非用户重新发起人工客服对话。

### 请求方式

```
POST
```

### 调用地址

https://api.gptbots.ai/v1/human/close

### 请求参数

| 参数            | 类型   | 说明                                      |
| :-------------- | :----- | :---------------------------------------- |
| conversation_id | string | 对话 ID，在客服回复接口需要透传给 GPTBots |
| timestamp       | long   | 时间戳                                    |

### 响应

| 参数            | 类型   | 说明                                           | required |
| :-------------- | :----- | :--------------------------------------------- | :------- |
| conversation_id | string | 对话ID，在会话创建接口和聊天接口有传，透传即可 | true     |
| timestamp       | long   | 时间戳                                         | true     |

