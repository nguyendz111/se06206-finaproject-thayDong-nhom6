package com.btec.quanlychess_api;

import org.springframework.boot.SpringApplication;

public class TestQuanlychessApiApplication {

	public static void main(String[] args) {
		SpringApplication.from(QuanlychessApiApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
