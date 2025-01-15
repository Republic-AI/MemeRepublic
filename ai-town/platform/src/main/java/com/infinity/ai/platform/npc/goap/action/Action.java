package com.infinity.ai.platform.npc.goap.action;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.ai.domain.model.ActionData;
import com.infinity.ai.domain.tables.NpcAction;
import com.infinity.ai.domain.tables.NpcTalk;
import com.infinity.ai.platform.manager.*;
import com.infinity.ai.platform.map.GameMap;
import com.infinity.ai.platform.map.object.MapObject;
import com.infinity.ai.platform.npc.NPC;
import com.infinity.ai.platform.task.system.BroadcastMesage;
import com.infinity.common.base.data.GameUserMgr;
import com.infinity.common.base.exception.BusinessException;
import com.infinity.common.base.exception.ResultCode;
import com.infinity.common.msg.platform.npc.NpcActionBroadRequest;
import com.infinity.common.utils.StringUtils;
import lombok.extern.slf4j.Slf4j;

import java.lang.reflect.ParameterizedType;
import java.util.*;

// Action 抽象类表示NPC的行动
@Slf4j
public abstract class Action<T> {
    protected Map<Integer, Action> preActions; //行动前置行为
    protected Map<String, Boolean> preconditions; // 行动的前置条件
    protected Map<String, Boolean> effects; // 行动的效果
    private int cost; // 行为的成本
    protected ObjectMapper mapper;
    private final ThreadLocal<Long> BID_LOCAL = new ThreadLocal<>();

    public Action(Map<String, Boolean> preconditions, Map<String, Boolean> effects, int cost) {
        this.preconditions = preconditions;
        this.effects = effects;
        this.cost = cost;
    }

    public Action(Map<Integer, Action> preActions) {
        this.preActions = preActions;
        mapper = new ObjectMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    public boolean checkPreconditions(Map<String, Boolean> state) {
        for (Map.Entry<String, Boolean> precondition : preconditions.entrySet()) {
            if (!state.getOrDefault(precondition.getKey(), false).equals(precondition.getValue())) {
                return false;
            }
        }
        return true;
    }

    public Map<String, Boolean> getEffects() {
        return effects;
    }

    public int getCost() {
        return cost;
    }

    public <T> T convertMapToPOJO(Map<String, Object> map, Class<T> clazz) throws Exception {
        return mapper.convertValue(map, clazz);
    }

    public void execute(NPC npc, Map<String, Object> map) {
        T data;
        try {
            Class<T> clz = (Class<T>) ((ParameterizedType) getClass().getGenericSuperclass()).getActualTypeArguments()[0];
            data = convertMapToPOJO(map, clz);
        } catch (Exception e) {
            e.printStackTrace();
            throw new BusinessException(ResultCode.FAILURE);
        }

        if (isPerform(npc)) {
            log.debug("当前行为正在执行,actionId={},params={}", this.getActionType().getCode(), map);
            //return;
        }

        //是否满足执行行为条件
        if (!canDoing(npc, data)) {
            return;
        }

        //行为前处理
        beforePerform(npc);
        //保存当前行为
        long bid = saveAction(npc, data);

        try {
            //执行当前行为
            setBid(bid);
            perform(npc, data);
        } finally {
            removeBid();
        }
    }

    public void sendMessage(NPC npc, Object... params) {
        NpcActionBroadRequest request = new NpcActionBroadRequest();
        NpcActionBroadRequest.RequestData data = new NpcActionBroadRequest.RequestData();
        data.setNpcId(npc.getId());
        data.setBid(getBid());
        data.setActionId(this.getActionType().getCode());
        data.setUsers(getUserIds(3));

        Map<String, Object> outParams = new HashMap<>();
        if (params != null) {
            int length = params.length;
            if (length % 2 != 0) {
                throw new BusinessException("参数格式有误");
            }

            for (int i = 0; i < length; i += 2) {
                outParams.put((String) params[i], params[i + 1]);
            }
        }

        data.setParams(outParams);
        request.setData(data);
        log.debug("sendMessage,msg={}", request.toString());
        BroadcastMesage.getInstance().send(npc.getId(), request.toString());
    }

    private Set<String> getUserIds(int num) {
        Set<String> users = new HashSet<>();
        List<Long> playerIds = GameUserMgr.getRandomKeys(num);
        playerIds.stream().forEach(playerId -> {
            Player player = PlayerManager.getInstance().getOnlinePlayerWithID(playerId);
            if (player != null) {
                users.add(player.getPlayerModel().getUserno());
            }
        });
        return users;
    }

    public MapObject findMapObj(String oid) {
        if (!StringUtils.isEmpty(oid)) {
            MapDataManager mapDataManager = MapDataManager.getInstance();
            GameMap gameMap = mapDataManager.getGameMap();
            if (!StringUtils.isEmpty(oid)) {
                MapObject object = gameMap.getObject(oid);
                if (object != null)
                    return object;
            }
        }

        //未找到农田
        throw new BusinessException(ResultCode.NOT_FOUND_OBJECT_ERROR);
    }

    //true：当前行为正在执行
    public boolean isPerform(NPC npc) {
        Map<Long, ActionData> behavior = npc.getNpcModel().get_v().getAction().getBehavior();
        for (Map.Entry<Long, ActionData> entry : behavior.entrySet()) {
            ActionData data = entry.getValue();
            if (data.getStatus() == 0 && data.getAid() == this.getActionType().getCode()) {
                return true;
            }
        }
        return false;
    }

    public void beforePerform(NPC npc) {
        //前一个是说话行为，则当前不是说话行为，则结束说话行为
        Integer caid = npc.getNpcModel().get_v().getAction().getLastAction().getAid();
        if (caid != null && ActionEnumType.isSpeak(caid) && this.getActionType().getCode() != caid) {
            NpcTalk talk = npc.getNpcModel().get_v().getTalk();
            talk.setTalking(false);
        }
    }

    public ActionData actionData(NPC npc) {
        NpcAction action = npc.getNpcModel().get_v().getAction();
        ActionData lastAction = action.getLastAction();
        if (lastAction.getAid() != null
                && lastAction.getAid() == this.getActionType().getCode()
                && lastAction.getStatus() == 0) {
            return lastAction;
        }

        ActionData newActionData = newActionData(npc.getId(), lastAction.getId());
        action.setLastAction(newActionData);
        action.getBehavior().putIfAbsent(newActionData.getId(), newActionData);
        return newActionData;
    }

    public ActionData newActionData(Long npcId, Long paid) {
        ActionData data = new ActionData();
        data.setId(IDManager.getInstance().getActionId());
        data.setNpcId(npcId);
        data.setAid(this.getActionType().getCode());
        data.setStartTime(System.currentTimeMillis());
        data.setStatus(0);
        data.setPaid(paid == null ? 0L : paid);
        data.setParams(new HashMap<>());
        return data;
    }

    public long saveAction(NPC npc, T params) {
        ActionData actionData = actionData(npc);
        String content = content(npc, params);
        if (content != null) {
            actionData.setContent(content);
        }
        return actionData.getId();
    }

    public void addActionLog(NPC npc, Map<String, Object> params) {
        addActionLog(getBid(), npc);
    }

    public void addActionLog(long bid, NPC npc) {
        ActionData actionData = npc.getNpcModel().get_v().getAction().getBehavior().get(bid);
        if (actionData == null) {
            ActionData lastAction = npc.getNpcModel().get_v().getAction().getLastAction();
            if (lastAction != null && lastAction.getId() != null && lastAction.getId() == bid) {
                actionData = lastAction;
            }
        }

        if (actionData != null) {
            actionData.setEndTime(System.currentTimeMillis());
            actionData.setStatus(1);
            try {
                RepositoryHelper.addActionLog(actionData);
            } catch (Exception e) {
                e.printStackTrace();
            }
            npc.getNpcModel().get_v().getAction().getBehavior().remove(bid);
        }
    }

    public void afterDoing(NPC npc, Map<String, Object> params) {
        this.afterPerform(npc, params);
        this.addActionLog(npc, params);
    }

    public void setBid(Long bid) {
        this.BID_LOCAL.set(bid);
    }

    public void removeBid() {
        this.BID_LOCAL.remove();
    }

    public Long getBid() {
        return BID_LOCAL.get();
    }

    public abstract String content(NPC npc, T params);

    public abstract ActionEnumType getActionType();

    public abstract boolean canDoing(NPC npc, T params);

    public abstract void perform(NPC npc, T params);

    public abstract void afterPerform(NPC npc, Map<String, Object> params);
}

