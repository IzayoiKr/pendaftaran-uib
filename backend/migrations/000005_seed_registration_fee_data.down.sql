DELETE FROM registration_fee WHERE (degree, batch_type) IN (
    ('S1', 'Reguler'),
    ('S1', 'Beasiswa'),
    ('S2', 'Reguler'),
    ('S2', 'Beasiswa')
);
