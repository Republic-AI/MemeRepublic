package com.infinity.ai.gateway.application;

import com.infinity.ai.gateway.task.DispatchTask;
import com.infinity.ai.gateway.task.ResponseTask;
import com.infinity.network.IChannel;
import com.infinity.protocol.HeaderOuterClass;
import com.infinity.protocol.ProtocolCommon;
import com.infinity.task.ITask;
import com.infinity.task.ITaskCreator;
import com.infinity.task.ITaskFactory;
import com.infinity.task.node.HeartbeatTask;
import com.infinity.task.node.NodeRegisterTask;
import com.infinity.task.node.NodeUpdateTask;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

@Slf4j
public class NewTaskFactory implements ITaskFactory {
    private static Map<Integer, ITaskCreator> creator_;

    /**
     * 在此注册命令任务
     */
    static {
        NewTaskFactory.initCreatorImpl();

        NewTaskFactory.register(ProtocolCommon.kHeartBeatCommand, HeartbeatTask::new);
        NewTaskFactory.register(ProtocolCommon.kUpdateNodeCommand, NodeUpdateTask::new);
        NewTaskFactory.register(ProtocolCommon.kRegisterNodeCommand, NodeRegisterTask::new);
        NewTaskFactory.register(com.infinity.common.msg.ProtocolCommon.MSG_DISPATCH, DispatchTask::new);
        NewTaskFactory.register(com.infinity.common.msg.ProtocolCommon.MSG_RESPONSE, ResponseTask::new);
        log.info("total commands: {}", creator_.size());
    }

    public static void initCreatorImpl() {
        if (NewTaskFactory.creator_ == null)
            NewTaskFactory.creator_ = new ConcurrentHashMap<>();
    }

    public static void finiCreatorImp() {
        if (NewTaskFactory.creator_ != null)
            NewTaskFactory.creator_.clear();
        NewTaskFactory.creator_ = null;
    }

    private static class Creator<T extends ITask> implements ITaskCreator {
        private final int command_;
        private final Supplier<T> creator_impl_;

        public Creator(final int command, final Supplier<T> creatorImpl) {
            this.command_ = command;
            this.creator_impl_ = creatorImpl;
        }

        @Override
        public int command() {
            return this.command_;
        }

        @Override
        public ITask create() {
            return this.creator_impl_.get();
        }
    }

    public static <T extends ITask> void register(final int command, final Supplier<T> taskCreator) {
        assert NewTaskFactory.creator_ != null;
        if (NewTaskFactory.creator_.putIfAbsent(command, new Creator<>(command, taskCreator)) != null)
            throw new IllegalArgumentException("repeat command " + command);
    }

    @Override
    public void dispose() {
        assert NewTaskFactory.creator_ != null;
        NewTaskFactory.finiCreatorImp();
    }

    @Override
    public ITask createTask(int command, HeaderOuterClass.Header header, byte[] buffer, IChannel channel, Object attachement) {
        assert NewTaskFactory.creator_ != null;
        ITaskCreator creator = NewTaskFactory.creator_.get(command);
        if (creator != null) {
            try {
                ITask newTask = creator.create();
                if (newTask != null) {
                    newTask.setChannel(channel);
                    newTask.setExtras(buffer);
                    newTask.setHeader(header);
                    newTask.setAttachment(attachement);
                    newTask.init();

                    return newTask;
                }
            } catch (Exception exception) {
                log.error("failed to create task.cmd={},header={},msg={}",
                        command, header.toString(), exception.getMessage());
                exception.printStackTrace();
            }
        } else {
            log.error("failed to creat task. cmd={},header={}", command, header.toString());
        }
        return null;
    }
}
