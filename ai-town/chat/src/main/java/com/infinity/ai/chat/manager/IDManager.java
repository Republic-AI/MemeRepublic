package com.infinity.ai.chat.manager;

import com.infinity.common.utils.Snowflake;

import java.util.concurrent.ThreadLocalRandom;

public class IDManager {
    private Snowflake snow;

    private static final class IDManagerHolder {
        private static final IDManager kInstance = new IDManager();
    }

    public static IDManager getInstance() {
        return IDManagerHolder.kInstance;
    }

    private IDManager() {
        init();
    }

    public void init() {
        snow = new Snowflake(ThreadLocalRandom.current().nextInt(20,40));
    }

    /**
     * 产生下一个ID
     *
     * @return ID
     */
    public long nextId() {
        return snow.nextId();
    }
}
