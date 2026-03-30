# Upgrade Plan: LogElec (20260330154254)

- **Generated**: 2026-03-30 15:42:54
- **HEAD Branch**: release/aws-deploy-2025-11-19
- **HEAD Commit ID**: b634a1aa4182dcbd59fc59b4557b8471a0a978c7

## Available Tools

**JDKs**
- JDK 21.0.8: `C:\Program Files\Java\jdk-21\bin` (current project JDK, used by step 2)
- JDK 25: **<TO_BE_INSTALLED>** (required by steps 3 and 4)

**Build Tools**
- Maven Wrapper (mvnw): 3.9.11 → **<TO_BE_UPGRADED>** to 4.0.x (Maven 3.x does not support Java 25 compilation; required by step 3)

## Guidelines

> Note: You can add any specific guidelines or constraints for the upgrade process here if needed, bullet points are preferred.

## Options

- Working branch: appmod/java-upgrade-20260330154254
- Run tests before and after the upgrade: true

## Upgrade Goals

- Upgrade Java from 21 to 25 (latest LTS)

### Technology Stack

| Technology/Dependency | Current | Min Compatible | Why Incompatible |
| --------------------- | ------- | -------------- | ---------------- |
| Java | 21 | 25 | User requested |
| Maven Wrapper | 3.9.11 | 4.0.0 | Maven 3.x does not support Java 25 bytecode compilation |
| Spring Boot | 4.0.0-SNAPSHOT | 4.0.0-SNAPSHOT | Already compatible with Java 25 |
| Lombok | 1.18.x (via Spring Boot BOM) | 1.18.30+ | Lombok requires re-validation on Java 25; managed by Spring Boot BOM |
| mysql-connector-java | 8.0.33 (deprecated groupId) | - | Old groupId `mysql:mysql-connector-java` deprecated; not a blocker but should be noted |

### Derived Upgrades

- Upgrade Maven Wrapper from 3.9.11 to 4.0.x — Maven 4.0+ is required to compile and test Java 25 bytecode
- Update `java.version` property in `pom.xml` from `21` to `25`

## Upgrade Steps

- **Step 1: Setup Environment**
  - **Rationale**: Install JDK 25 (the target LTS), which is not currently present on this machine.
  - **Changes to Make**:
    - [ ] Install JDK 25
  - **Verification**:
    - Command: `#appmod-list-jdks` to confirm JDK 25 is installed
    - Expected: JDK 25 available at a known path

---

- **Step 2: Setup Baseline**
  - **Rationale**: Establish pre-upgrade compile and test results to measure upgrade success against.
  - **Changes to Make**:
    - [ ] Run baseline compilation with JDK 21
    - [ ] Run baseline tests with JDK 21
  - **Verification**:
    - Command: `.\mvnw.cmd clean test -q`
    - JDK: `C:\Program Files\Java\jdk-21\bin`
    - Expected: Document compile and test results as acceptance baseline

---

- **Step 3: Upgrade Java to 25 and Maven Wrapper to 4.0.x**
  - **Rationale**: Update the project's Java version target to 25 and upgrade the Maven wrapper to 4.0.x, which is required to compile Java 25 bytecode. Both changes are logically coupled and can be done in a single step.
  - **Changes to Make**:
    - [ ] Update `<java.version>` in `pom.xml` from `21` to `25`
    - [ ] Update `distributionUrl` in `.mvn/wrapper/maven-wrapper.properties` to Maven 4.0.x
    - [ ] Fix any compilation errors caused by removed or changed APIs in Java 25
  - **Verification**:
    - Command: `.\mvnw.cmd clean test-compile -q`
    - JDK: JDK 25 path (installed in step 1)
    - Expected: Compilation SUCCESS (main + test sources)

---

- **Step 4: Final Validation**
  - **Rationale**: Verify all upgrade goals are met, the project compiles successfully with Java 25, and all tests pass.
  - **Changes to Make**:
    - [ ] Verify `java.version=25` in `pom.xml`
    - [ ] Verify Maven wrapper uses Maven 4.0.x
    - [ ] Resolve any remaining compilation issues
    - [ ] Run full test suite and fix ALL test failures (iterative fix loop until 100% pass)
  - **Verification**:
    - Command: `.\mvnw.cmd clean test -q`
    - JDK: JDK 25 path
    - Expected: Compilation SUCCESS + 100% tests pass

## Key Challenges

- **Maven 4.x migration**
  - **Challenge**: Maven 4.0 introduced breaking changes in the build model (e.g., consumer POM, stricter POM validation). The project may need minor POM adjustments.
  - **Strategy**: Upgrade wrapper to the latest Maven 4.0.x stable release. Address any POM validation errors flagged by Maven 4.

- **Java 25 API changes**
  - **Challenge**: Java 25 finalizes several features that were previews in Java 21 (e.g., Virtual Threads, Structured Concurrency, String Templates). Some preview or deprecated APIs from Java 21 may be removed.
  - **Strategy**: Compile with Java 25 and fix any `error: cannot find symbol` or deprecation-removal errors. Given the codebase is small and uses standard Spring Boot patterns, breakage is expected to be minimal.

## Plan Review

- Coverage: All upgrade goals addressed. Java 21 → 25 with Maven wrapper upgrade is the full scope.
- Feasibility: Straightforward upgrade with minimal risk. Spring Boot 4.0.0-SNAPSHOT already targets Java 17+ and supports Java 25. The project has a single module and a minimal test suite.
- Limitations: Spring Boot 4.0.0-SNAPSHOT is a snapshot release; if snapshot artifacts become unavailable from the Spring repository during the build, the build may fail for reasons unrelated to the Java upgrade. If this occurs, the pom.xml snapshot repositories are already configured and should resolve the issue.

