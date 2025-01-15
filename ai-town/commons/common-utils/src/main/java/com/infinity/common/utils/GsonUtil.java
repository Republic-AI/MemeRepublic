package com.infinity.common.utils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class GsonUtil {
    private static Gson gson = new GsonBuilder().create();
    private static JsonParser jsonp = new JsonParser();

    public static <T> T parseJson(String json, Class<T> t) {
        return gson.fromJson(json, t);
    }

    public static JsonObject parseJson(String json) {
        return jsonp.parse(json).getAsJsonObject();
    }

    public static String parseObject(Object obj) {
        return gson.toJson(obj);
    }
}
