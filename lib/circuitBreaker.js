class CircuitBreaker {
  constructor(timeout = 60000) {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.failureThreshold = 5;
    this.resetTimeout = timeout;
    this.lastFailureTime = null;
  }

  async call(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = 'HALF-OPEN';
      } else {
        throw new Error('Circuit is OPEN');
      }
    }

    try {
      const result = await fn();
      if (this.state === 'HALF-OPEN') {
        this.success();
      }
      return result;
    } catch (err) {
      this.failure();
      throw err;
    }
  }

  success() {
    this.failureCount = 0;
    this.state = 'CLOSED';
    this.lastFailureTime = null;
  }

  failure() {
    this.failureCount += 1;
    if (this.failureCount >= this.failureThreshold) {
      this.trip();
    }
  }

  trip() {
    this.state = 'OPEN';
    this.lastFailureTime = Date.now();
  }
}

export default CircuitBreaker;
