package com.infinity.ai.platform.map;

import com.infinity.ai.platform.application.Config;
import com.infinity.ai.platform.map.event.MapEventManager;
import com.infinity.ai.platform.map.object.MapData;
import com.infinity.ai.platform.map.object.MapObject;
import com.infinity.ai.platform.npc.map.AStar;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Map;

@Slf4j
public class GameMap {
    //地图数据
    public MapData mapData;
    // 地图表示，0表示可通行，1表示障碍物
    //public final int[][] map;
    //地图事件管理器
    public final MapEventManager eventManager;
    //A*寻址算法
    public AStar aStar;

    public GameMap() {
        //加载地图坐标数据
        String gameDataPath = Config.getInstance().getGameDataPath();
        /*map = MapLoader.parseMap(gameDataPath + "/AiTownMap.tmx");
        aStar = new AStar(map);*/

        try {
            //加载地图数据
            this.mapData = MapLoader.mapParser(gameDataPath + "/MapData.json");
        } catch (Exception e) {
            e.printStackTrace();
            log.info("loadMap data error......");
            System.exit(-1);
        }

        eventManager = new MapEventManager(mapData);
    }

    public MapObject getObject(String objId) {
        return mapData.getObject(objId);
    }

    public List<MapObject> getByNpcIdType(Integer npcId, String type) {
        return mapData.getByNpcIdType(npcId, type);
    }

    public Map<String, List<MapObject>> getByNpcId(Integer npcId){
        return mapData.getByNpcId(npcId);
    }
}
