package com.infinity.ai.platform.npc;


import com.infinity.ai.PNpc;
import com.infinity.ai.domain.model.ActionData;
import com.infinity.ai.platform.manager.MapDataManager;
import com.infinity.ai.platform.manager.NpcHolder;
import com.infinity.ai.platform.npc.action.BehaviorNode;
import com.infinity.ai.platform.npc.character.CharacterType;
import com.infinity.ai.platform.npc.data.NpcDataListener;
import com.infinity.ai.platform.npc.event.Event;
import com.infinity.ai.platform.npc.event.EventListener;
import com.infinity.ai.platform.npc.goap.GOAPPlanner;
import com.infinity.ai.platform.npc.goap.Goal;
import com.infinity.ai.platform.npc.goap.action.Action;
import com.infinity.ai.platform.npc.live.Room;
import com.infinity.ai.platform.npc.map.Position;
import com.infinity.ai.platform.npc.state.State;
import com.infinity.ai.platform.npc.state.StateMachine;
import com.infinity.common.base.thread.ThreadConst;
import com.infinity.common.base.thread.Threads;
import com.infinity.common.base.thread.timer.IntervalTimer;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import java.util.*;

@Getter
@Setter
@Slf4j
public abstract class NPC implements EventListener {
    //NPC ID
    public Long id;
    public String name;
    //队伍ID
    private int teamId = 0;
    //true 停止运行，false：运行
    private boolean exit = false;
    //在线NPC持有者
    private NpcHolder holder;
    //NPC数据监听器
    private final NpcDataListener npcDataListener;

    //2.行为树
    private BehaviorNode behaviorTree;
    //3.状态机
    private StateMachine stateMachine;

    //当前位置
    private Position position;
    //事件集合
    private List<Event> events;

    private List<Goal> goals; // NPC的目标列表
    private Map<String, Boolean> worldState; // NPC的世界状态
    private List<Action> currentPlan; // 当前的行动计划
    private Goal currentGoal; // 当前的目标

    private Map<Integer, Action> actions; // NPC的行动列表
    private Set<Integer> doing;
    private Set<Long> playerIds;

    public NPC(Long id, String name) {
        this.id = id;
        this.name = name;
        this.events = new ArrayList<>();
        this.actions = new HashMap<>();
        this.currentPlan = new ArrayList<>();
        this.doing = new HashSet<>();
        this.registAction();
        this.stateMachine = new StateMachine(this);
        this.npcDataListener = new NpcDataListener(this);
        this.playerIds = new HashSet<>();
    }

    //初始化数据
    public void initialize() {
        this.init();
        this.initPosition();
        //注册事件
        //NpcManager.getInstance().getEventManager().subscribe(this);
        //初始化数据
        if (npcType() != CharacterType.Player) {
            this.npcDataListener.initNpcData();
        }

        Room.getInstance().init(this.id);
    }

    //启动npc
    public void start() {
        //玩家NPC由玩家操控
        if (npcType() == CharacterType.Player) {
            return;
        }

        //启动每帧服务
        Threads.addListener(ThreadConst.TIMER_1S, "npc#run", new IntervalTimer(5000, 10000) {
            @Override
            public boolean exec0(int interval) {
                return run();
            }
        });
    }

    //按固定帧数执行NPC业务
    public boolean run() {
        if (exit) {
            log.debug("npc has exit,npcId={},name={}", id, name);
            return true;
        }

        try {
            update();
        } catch (Exception e) {
            e.printStackTrace();
        }

        //返回true 则停止运行，false：持续运行
        return false;
    }

    public void update() {
        log.debug("npcId={},name={}", id, name);
        //状态变化
        stateMachine.update();

        //行为树
        if (behaviorTree != null) {
            behaviorTree.execute();
        }

        //事件变更
        events.stream().forEach(event -> {
            if (event != null) {
                /*switch (event.getType()) {
                    case EventType.TIME_CHANGE:
                        //handlePlayerApproach((PlayerApproachEvent) event);
                        break;
                    case "TimeChange":
                        //handleTimeChange((TimeChangeEvent) event);
                        break;
                }*/
            }
        });

        events.clear();
    }


    // 更新NPC状态，执行最高优先级的目标
    public void fixUpdate() {
        if (currentGoal == null || currentPlan.isEmpty() || currentGoal.isCompleted()) {
            currentGoal = getHighestPriorityGoal();
            if (currentGoal != null) {
                currentPlan = GOAPPlanner.plan(this, currentGoal);
            }
        }

        if (currentGoal != null && !currentPlan.isEmpty()) {
            Action action = currentPlan.remove(0);
            if (action.checkPreconditions(worldState)) {
                action.perform(this, null);
                worldState.putAll(action.getEffects());

                if (isGoalAchieved(currentGoal, worldState)) {
                    currentGoal.setCompleted(true); // 标记目标为已完成
                } else {
                    currentGoal.setCompleted(false); // 标记目标为未完成
                }
            }
        }
    }

    private Goal getHighestPriorityGoal() {
        return goals.stream()
                //.filter(goal -> (!goal.isCompleted() || stateChange)) // 过滤掉已完成的目标
                .filter(goal -> !isGoalAchieved(goal, this.worldState)) // 过滤掉已完成的目标
                .max(Comparator.comparingInt(Goal::getPriority))
                .orElse(null);
    }

    private boolean isGoalAchieved(Goal goal, Map<String, Boolean> state) {
        for (Map.Entry<String, Boolean> condition : goal.getConditions().entrySet()) {
            if (!state.getOrDefault(condition.getKey(), false).equals(condition.getValue())) {
                return false;
            }
        }
        return true;
    }

    //事件触发
    @Override
    public void onEvent(Event event) {
        this.events.add(event);
    }

    //状态变更
    public void changeState(State newState) {
        stateMachine.changeState(newState);
    }

    //NPC创建后，初始化
    protected abstract void init();

    //NPC类型
    protected abstract CharacterType npcType();

    //注册NPC行为
    protected abstract void registAction();

    //系统启动初始化正在做的行为
    protected void initAction() {
        Map<Long, ActionData> behavior = this.getNpcModel().get_v().getAction().getBehavior();
        Iterator<Map.Entry<Long, ActionData>> iter = behavior.entrySet().iterator();
        while (iter.hasNext()) {
            Map.Entry<Long, ActionData> next = iter.next();
            ActionData data = next.getValue();
            if (data.getStatus() == 1) {
                iter.remove();
                Action action = this.actions.get(data.getAid());
                action.addActionLog(data.getId(), this);
                continue;
            }

            Action action = this.actions.get(data.getAid());
            if (action != null) {
                this.doing.add(data.getAid());
            }
        }
    }

    public void doAction(int actionId, Map<String, Object> params) {
        Action action = this.actions.get(actionId);
        if (action != null) {
            this.doing.add(actionId);
            action.execute(this, params);
        }
    }

    /**
     * 行为结束
     *
     * @param bid    行为批次号
     * @param params
     */
    public void finishAction(Long bid, Map<String, Object> params) {
        ActionData actionData = this.getNpcModel().get_v().getAction().getBehavior().get(bid);
        if (actionData == null) {
            actionData = this.getNpcModel().get_v().getAction().getLastAction();
            if (actionData == null || actionData.getId() == null || bid != actionData.getId().longValue()) {
                log.debug("not found action, bid={}", bid);
                return;
            }
        }

        if (actionData != null && actionData.getStatus() != 0) {
            log.debug("action done, bid={}", bid);
            return;
        }

        Action action = this.actions.get(actionData.getAid());
        if (action != null) {
            try {
                action.setBid(bid);
                action.afterDoing(this, params);
                removeAction(actionData.getAid());
            } finally {
                action.removeBid();
            }
        }
    }

    public void addAction(Action action) {
        this.actions.putIfAbsent(action.getActionType().getCode(), action);
    }

    public void addCurrentAction(Action action) {
        this.currentPlan.add(action);
    }

    public void removeAction(int actionId) {
        this.doing.remove(actionId);
    }

    private void initPosition() {
        if (this.position == null) {
            PNpc npcModel = this.getNpcModel();
            this.position = new Position(npcModel.getX(), npcModel.getY());
        }
    }

    public void updatePosition(Integer x, Integer y) {
        if (this.position == null) {
            this.position = new Position(0, 0);
        }

        boolean isUpdate = false;
        PNpc npcModel = this.getHolder().getNpcModel();
        if (x != null && x > 0) {
            this.position.setX(x);
            npcModel.setX(x);
            isUpdate = true;
        }

        if (y != null && y > 0) {
            this.position.setY(y);
            npcModel.setY(y);
            isUpdate = true;
        }

        if (isUpdate) {
            npcDataListener.npcData.surroundings.clear();
            Threads.runAsync(ThreadConst.QUEUE_LOGIC, id, "npc#position", () -> {
                //地图靠近事件、查找附件的人
                MapDataManager.getInstance().getGameMap().eventManager.checkEvents(this);

                //同步数据
                //npcDataListener.notifyProperty(false);
            });
        }
    }

    //根据坐标计算距离，查找指定范围内的对象
    public double distanceTo(NPC npc) {
        double dx = this.position.x - npc.getPosition().x;
        double dy = this.position.y - npc.getPosition().y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    public PNpc getNpcModel() {
        return this.getHolder().getNpcModel();
    }
}
