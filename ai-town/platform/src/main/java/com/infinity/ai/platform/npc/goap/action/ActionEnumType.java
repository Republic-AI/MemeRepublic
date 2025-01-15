package com.infinity.ai.platform.npc.goap.action;

import lombok.Getter;

import java.util.Arrays;
import java.util.Objects;
import java.util.Optional;

//NPC 行为类型
@Getter
public enum ActionEnumType {
    Free(99, "free"),
    Farming(100, "farming"),
    Harvest(101, "harvest"),
    Sale(102, "sale"),
    Buy(103, "buy"),
    Cook(104, "cook"),
    Dinning(105, "dinning"),
    Sleep(106, "sleep"),
    Feeding(107, "Feeding"),
    Slaughter(108, "slaughter"),
    Make(109, "make"),
    Speak(110, "Speak"),
    GetUp(111, "getUp"),
    Move(112, "move");

    /**
     * 100	耕种	ploughSow
     * 101	采收	harvest
     * 102	销售	sale
     * 103	购买	buy
     * 104	做饭	cook
     * 105	吃	dinning
     * 106	睡眠	sleep
     * 107	投喂	Feeding
     * 108	屠宰	slaughter
     * 109	制作	make
     * 110	说话	transport
     * 111	起床	GetUp
     * 112	移动	Move
     */

    private final int code;
    private final String name;

    ActionEnumType(int code, String name) {
        this.code = code;
        this.name = name;
    }

    public static Optional<ActionEnumType> getByCode(int code) {
        return Arrays.stream(values()).filter(o -> Objects.equals(o.code, code)).findFirst();
    }

    public static boolean isSpeak(int code) {
        return ActionEnumType.Speak.code == code;
    }
}
