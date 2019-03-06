'use strict';

describe('Service: Suggestion', function() {
    var service;

    beforeEach(function() {
        module('ddsApp');
        inject(function(SuggestionService) {
            service = SuggestionService;
        });
    });

    describe('determineExtensionAndRepository', function() {
        var result;
        describe('national aids', function() {
            beforeEach(function() {
                result = service.determineExtensionAndRepository([{
                    provider: { level: 'prestationsNationales' }
                }]);
            });

            it('has no extension for national aids', function() {
                expect(result.extension).toBeFalsy();
            });

            it('targets openfisca-france', function() {
                expect(result.repository).toBe('openfisca-france');
                expect(result.owner).toBe('openfisca');
            });
        });

        describe('local aids', function() {
            beforeEach(function() {
                result = service.determineExtensionAndRepository([{
                    provider: {
                        level: 'partenairesLocaux',
                        repository: 'provider'
                    }
                }]);
            });


            it('targets the extension', function() {
                expect(result.extension).toBeTruthy();
                expect(result.owner).toBe('betagouv');
                expect(result.repository).toBe('openfisca-provider');
            });
        });
    });
});
