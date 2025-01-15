package com.infinity.common.msg.platform.player;

import com.infinity.common.msg.BaseMsg;
import com.infinity.common.msg.ProtocolCommon;

//登录返回消息
public class LoginResponse extends BaseMsg<LoginResponse.ResponseData> {

    public static class ResponseData {
        // 玩家验签信息
        private String token;
        //服务器时间戳
        private long timestamp = 5;
        //玩家信息
        private PlayerData player;

        public String getToken() {
            return token;
        }

        public void setToken(String token) {
            this.token = token;
        }

        public long getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(long timestamp) {
            this.timestamp = timestamp;
        }

        public PlayerData getPlayer() {
            return player;
        }

        public void setPlayer(PlayerData player) {
            this.player = player;
        }
    }

    @Override
    public int getType() {
        return ProtocolCommon.MSG_TYPE_PLATFORM;
    }

    @Override
    public int getCommand() {
        return ProtocolCommon.LOGIN_COMMAND;
    }

    public static int getCmd(){
        return ProtocolCommon.LOGIN_COMMAND;
    }
}
