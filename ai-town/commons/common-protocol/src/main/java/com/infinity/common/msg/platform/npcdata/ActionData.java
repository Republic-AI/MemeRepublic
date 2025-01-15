package com.infinity.common.msg.platform.npcdata;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ActionData {
    public String actionName;
    public Integer actionId;
}

/*
"action": {  //当前正在做的行为
        "actionName": "行为名称",
        "actionId": 100
    },
 */