import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Pristine from "../src/pristine";

describe('Integrity', function() {

  beforeEach(() => {
    const fixture =
      `<div id="fixture">
				<form id="form" novalidate method="post">
					<div class="form-group">
						<input id="input" type="text" required class="form-control" />
						<input id="hidden-input" type="hidden" required class="form-control" />
					</div>
			 </form>
			</div>`;

    document.body.insertAdjacentHTML('afterbegin', fixture);
  });

  afterEach(() => {
    document.body.removeChild(document.getElementById('fixture'));
  });


  it('should have no errors when validates to true', async () => {

    let form = document.getElementById("fixture")
    let input = document.getElementById("input")
    let pristine = new Pristine(form);

    input.value = "some value";

    expect(await pristine.validate()).toBe(true);
    expect(pristine.getErrors().length).toBe(0);

  });

  it('should not validate hidden input', async () => {

    let form = document.getElementById("fixture")
    let pristine = new Pristine(form);

    expect(await pristine.validate()).toBe(false);
    expect(pristine.getErrors().length).toBe(1);

    let input = document.getElementById("input")
    input.value = "some value";
    expect(await pristine.validate()).toBe(true);
    expect(pristine.getErrors().length).toBe(0);

    expect(await pristine.validate(document.getElementById("input-hidden"))).toBe(true);

  });


  /*
    it('should not show error when silently validating', () => {

    });

    it('should not proceed when halt is found', () => {

    });

    it('should clean up when called destroy', () => {

    });
    */
});

