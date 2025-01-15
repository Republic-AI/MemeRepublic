package com.infinity.ai.chat.common;

import org.redisson.api.RBucket;
import org.redisson.client.codec.Codec;
import org.redisson.client.codec.StringCodec;


public enum RedisKeyEnum {

    CHAT("chat:list", RBucket.class, new StringCodec()),

    ;

    private final String key;
    public final Class<?> redissonType;
    public final Codec codec;


    RedisKeyEnum(String key, Class<?> redissonType, Codec codec) {
        this.key = key;
        this.redissonType = redissonType;
        this.codec = codec;
    }

    public String getKey(Object... args) {
        return (args == null || args.length == 0) ? this.key : String.format(this.key, args);
    }
}
