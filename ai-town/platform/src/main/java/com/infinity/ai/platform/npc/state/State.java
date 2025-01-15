package com.infinity.ai.platform.npc.state;

import com.infinity.ai.platform.npc.NPC;

//状态接口
public interface State {
    void enter(NPC npc);

    void execute(NPC npc);

    void exit(NPC npc);
}