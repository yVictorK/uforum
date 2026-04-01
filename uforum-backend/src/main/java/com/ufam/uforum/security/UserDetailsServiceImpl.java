package com.ufam.uforum.security;

import com.ufam.uforum.entity.User;
import com.ufam.uforum.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + email));

        return new org.springframework.security.core.userdetails.User(
            user.getEmail(),
            user.getPassword(),
            user.getIsActive(),
            true, true, true,
            List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
