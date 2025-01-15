package com.infinity.ai.platform.npc.character;

import lombok.Getter;

import java.util.Arrays;
import java.util.Objects;
import java.util.Optional;

//NPC角色类型
@Getter
public enum CharacterType {
    Player(0, "Player"),
    Farmer(1, "Farmer"),
    Grocer(2, "Grocer"),
    Herdman(3, "Herdman"),
    Baker(4, "Baker");

    private final int code;
    private final String name;

    CharacterType(int code, String name) {
        this.code = code;
        this.name = name;
    }

    public static Optional<CharacterType> getByCode(int code) {
        return Arrays.stream(values()).filter(o -> Objects.equals(o.code, code)).findFirst();
    }
}
