package com.infinity.common.msg.platform.npcdata;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class NpcData {
    public Long npcId;
    public String status = "idle";

    public InfoData info;
    public List<SellingData> selling;
    public List<ItemsData> items;
    public ActionData action;
    public List<MapData> mapData;
    public Surroundings surroundings;
    public TalkData talk;

    public NpcData(Long npcId) {
        this.npcId = npcId;
        action = new ActionData();
        surroundings = new Surroundings();
        talk = new TalkData();
        /*selling = new ArrayList<>();
        items = new ArrayList<>();
        mapData = new ArrayList<>();
        talk = new ArrayList<>();*/
    }
}
