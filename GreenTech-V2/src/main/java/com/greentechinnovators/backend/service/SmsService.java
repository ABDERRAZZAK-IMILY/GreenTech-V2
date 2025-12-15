package com.greentechinnovators.backend.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;


@Service
public class SmsService {


    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.messaging-sid}")
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
