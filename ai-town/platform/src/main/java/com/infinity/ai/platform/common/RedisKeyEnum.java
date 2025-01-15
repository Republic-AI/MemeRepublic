package com.infinity.ai.platform.common;

import org.redisson.api.RBucket;
import org.redisson.api.RSet;
import org.redisson.api.RSortedSet;
import org.redisson.client.codec.Codec;
import org.redisson.client.codec.LongCodec;
import org.redisson.client.codec.StringCodec;
import org.redisson.codec.SerializationCodec;


public enum RedisKeyEnum {

    MACHINE_ID("id:machine", null, null),
    SIGN_KEY("sign:%s", RBucket.class, new StringCodec()),
    ACTION_ID("id:action", null, null),
    LIVE_ROOM("npc:live:room:%s", RSortedSet.class, new LongCodec()),
    LIVE_RANK("npc:live:rank:%s", RSortedSet.class, new LongCodec()),
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
