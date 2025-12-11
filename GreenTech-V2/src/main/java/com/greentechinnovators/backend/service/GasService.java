package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.mapper.GasMapper;
import com.greentechinnovators.backend.repository.GasRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GasService {
    private final GasRepository gasRepository;
    private final GasMapper gasMapper;

}
