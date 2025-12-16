package com.greentechinnovators.backend.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;


@Service
public class SmsService {


    @Value("${spring.app.twilio.account-sid:AC9226a83c6bd1e71b0f22c4671c95a1f4}")
    private String accountSid;

    @Value("${spring.app.twilio.auth-token:3fd4ddae8ef3789af683b3c8e6b53db2}")
    private String authToken;

    @Value("${spring.app.twilio.messaging-sid:MGcecdbbb0226389355f738a06a10c6c40}")
    private String messagingSid;
    public void sendSms(String to, String body) {
        Twilio.init(accountSid, authToken);

        Message.creator(
                new PhoneNumber(to),
                messagingSid,
                body
        ).create();
    }
}
