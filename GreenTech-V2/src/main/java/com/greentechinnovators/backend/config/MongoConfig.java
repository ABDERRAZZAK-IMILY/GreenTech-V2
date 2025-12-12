package com.greentechinnovators.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Configuration
public class MongoConfig {

    @Bean
    public MongoCustomConversions customConversions() {
        List<Converter<?, ?>> converters = new ArrayList<>();
        converters.add(new LocalDateTimeToDateConverter());
        converters.add(new DateToLocalDateTimeConverter());
        return new MongoCustomConversions(converters);
    }

    // Writer: Java -> Mongo
    static class LocalDateTimeToDateConverter implements Converter<LocalDateTime, Date> {
        @Override
        public Date convert(LocalDateTime source) {
            // Converts local time to Date (system default zone)
            return Date.from(source.atZone(ZoneId.systemDefault()).toInstant());
        }
    }

    // Reader: Mongo -> Java
    static class DateToLocalDateTimeConverter implements Converter<Date, LocalDateTime> {
        @Override
        public LocalDateTime convert(Date source) {
            // Converts Date back to local time
            return LocalDateTime.ofInstant(source.toInstant(), ZoneId.systemDefault());
        }
    }
}