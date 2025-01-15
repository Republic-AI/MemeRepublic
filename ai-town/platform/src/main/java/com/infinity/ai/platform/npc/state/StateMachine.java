package com.infinity.ai.platform.npc.state;

import com.infinity.ai.platform.npc.NPC;

//状态机类
public class StateMachine {
    private NPC npc;
    private State currentState;

    public StateMachine(NPC npc) {
        this.npc = npc;
    }

    public void changeState(State newState) {
        if (currentState != null) {
            currentState.exit(npc);
        }
        currentState = newState;
        currentState.enter(npc);
    }

    public void update() {
        if (currentState != null) {
            currentState.execute(npc);
        }
    }
}