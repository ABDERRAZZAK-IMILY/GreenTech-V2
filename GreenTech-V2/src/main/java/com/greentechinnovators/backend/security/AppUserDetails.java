package com.greentechinnovators.backend.security;


import com.greentechinnovators.backend.entity.User;
import lombok.AllArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@AllArgsConstructor
public class AppUserDetails implements UserDetails {

    private  final User user;


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
   return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }


    public String getId(){
        return user.getId();
    }


    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }




}
