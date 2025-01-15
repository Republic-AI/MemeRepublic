package com.infinity.ai.chat.manager;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class ChatManager {

    private static class Holder {
        private static final ChatManager kInstance = new ChatManager();
    }

    public static ChatManager getInstance() {
        return Holder.kInstance;
    }

    public void init() {

    }

    public void reflushChatGPT() {

    }

    public void dispose() {

    }


}
