package com.infinity.ai.platform.npc.action;

import com.infinity.ai.platform.npc.NPC;

// 4.行为节点（Action）：执行具体的行为
public class Action extends BehaviorNode {
    private Runnable action;

    public Action(Runnable action) {
        this.action = action;
    }

    @Override
    public boolean execute(NPC npc) {
        action.run();
        return true;
    }
}