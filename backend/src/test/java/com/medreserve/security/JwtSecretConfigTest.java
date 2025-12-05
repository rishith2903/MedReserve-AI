package com.medreserve.security;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import static org.assertj.core.api.Assertions.assertThat;

class JwtSecretConfigTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(com.medreserve.config.JwtSecretConfig.class);

    @Test
    void contextFailsWhenSecretMissing() {
        contextRunner
                .withPropertyValues("security.jwt.secret=")
                .run(context -> {
                    assertThat(context).hasFailed();
                    assertThat(context.getStartupFailure()).hasRootCauseInstanceOf(IllegalStateException.class);
                });
    }

    @Test
    void contextFailsWhenSecretTooShort() {
        contextRunner
                .withPropertyValues("security.jwt.secret=short-secret")
                .run(context -> {
                    assertThat(context).hasFailed();
                    assertThat(context.getStartupFailure()).hasRootCauseInstanceOf(IllegalStateException.class);
                });
    }

    @Test
    void contextLoadsWithValidSecret() {
        contextRunner
                .withPropertyValues("security.jwt.secret=dev-0123456789-abcdefghijklmnopqrstuvwxyz-012345")
                .run(context -> assertThat(context).hasNotFailed());
    }
}
