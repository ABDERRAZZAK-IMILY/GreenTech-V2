package com.greentechinnovators.backend.security;


import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final  CustomUserDetailsService customUserDetailsService;

    private  final  JwtUtils jwtUtils;

    @Autowired
    public JwtAuthenticationFilter(JwtUtils jwtUtils, CustomUserDetailsService customUserDetailsService) {

        this.jwtUtils = jwtUtils;
        this.customUserDetailsService = customUserDetailsService;

    }

    @Override
    protected void doFilterInternal(HttpServletRequest request , HttpServletResponse response , FilterChain filterChain) throws ServletException, IOException {

        String jwt = parsejwt(request);

        if (jwt != null && jwtUtils.validateToken(jwt) && SecurityContextHolder.getContext().getAuthentication() == null){

            String username = jwtUtils.extractUsername(jwt);

            UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

            SecurityContextHolder.getContext().setAuthentication(authToken);




        }


        filterChain.doFilter(request,response);


    }


    private String parsejwt(HttpServletRequest request){

        String haederAuth = request.getHeader("Authorization");

        if(haederAuth != null && haederAuth.startsWith("Bearer ")){

            return haederAuth.substring(7);

        }
        return null;



    }




}
