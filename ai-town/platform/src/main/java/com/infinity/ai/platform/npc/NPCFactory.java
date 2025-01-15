package com.infinity.ai.platform.npc;

import com.infinity.ai.PNpc;
import com.infinity.ai.platform.npc.character.*;

import static com.infinity.ai.platform.npc.character.CharacterType.getByCode;

public class NPCFactory {
    //创建NPC
    public static NPC createNPC(PNpc npc) {
        CharacterType type = getByCode(npc.getType()).get();
        if (type == null) {
            return null;
        }

        switch (type) {
            case Player:
                return new PlayerNPC(npc.getId(), npc.getName());
            case Farmer:
                return new FarmerNPC(npc.getId(), npc.getName());
            case Grocer:
                return new GrocerNPC(npc.getId(), npc.getName());
            case Herdman:
                return new HerdmanNPC(npc.getId(), npc.getName());
            case Baker:
                return new BakerNPC(npc.getId(), npc.getName());
            default:
                throw new IllegalArgumentException("Unknown npc type: " + type);
        }
    }
}
