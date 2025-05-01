import { Test, TestingModule } from '@nestjs/testing';
import { In } from 'typeorm';
import { GenreRepository } from '../repositories/genre.repository';
import { GenreService } from '../genre.service';
import { Genre } from '../entities/genre.entity';

describe('GenreService', () => {
  let service: GenreService;
  let mockGenreRepository: Partial<Record<keyof GenreRepository, jest.Mock>>;

  beforeEach(async () => {
    mockGenreRepository = {
      save: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenreService,
        {
          provide: GenreRepository,
          useValue: mockGenreRepository,
        },
      ],
    }).compile();

    service = module.get<GenreService>(GenreService);
  });

  describe('saveNewGenre', () => {
    it('should save and return a new genre', async () => {
      const genreName = 'Action';
      const expectedGenre = { id: '1', name: genreName } as Genre;

      mockGenreRepository.save.mockResolvedValue(expectedGenre);

      const result = await service.saveNewGenre(genreName);

      expect(mockGenreRepository.save).toHaveBeenCalledWith(expect.objectContaining({ name: genreName }));
      expect(result).toEqual(expectedGenre);
    });
  });

  describe('findByIds', () => {
    it('should return genres with matching ids', async () => {
      const ids = ['1', '2'];
      const expectedGenres = [
        { id: '1' },
        { id: '2' },
      ];

      mockGenreRepository.find.mockResolvedValue(expectedGenres);

      const result = await service.findByIds(ids);

      expect(mockGenreRepository.find).toHaveBeenCalledWith({
        where: { id: In(ids) },
        select: { id: true },
      });
      expect(result).toEqual(expectedGenres);
    });
  });
});
